import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MysqlService } from 'src/database/mysql.service';
import { SocketService } from 'src/common/socket.service';
import { eProtocolId, eResultCode } from 'src/common/chat.protocol';
import { ChatChannelDTO, ChatConnectDTO, ChatSendDTO, ChatUserListDTO } from 'src/common/chat.protocol.dto';
import { ChannelID, ChannelType } from 'src/common/common';

let user_id = 0;

@Injectable()
export class ChatLobbyService {  
  constructor(
    private readonly socketService: SocketService) {
  }

  /** 
   * 클라이언트 로그인
   * @param socket - socket.io socket
   * @param req - received data
   */
  public async onChatConnect(client: Socket, req: ChatConnectDTO) {
    Logger.debug(`${JSON.stringify(req)}`, this.onChatConnect.name);
    
    const userId = client.id
    const profile = await this.getUserProfile(userId, req.nick);
    if(!profile) {
      Logger.warn(`could not find user profile ${userId}`, this.onChatConnect.name);
      client.send({ protocolId: eProtocolId.CS_CHAT_CONNECT, result: eResultCode.USER_NOT_FOUND });
      return client.disconnect();
    }

    client.data.userId = userId;
    client.data.nick = profile.nick;

    const num = await this.getWorldChannel();
    const channelId = ChannelID.make(ChannelType.World, num);
    client.data.wd = channelId;

    await client.join(channelId.toString());
    client.send({ 
      protocolId: eProtocolId.PC_CHAT_JOIN, 
      result: eResultCode.SUCCESS,
      type: ChannelType.World,
      channel: channelId,
      id: client.id.substring(0, 8),
      nick: client.data.nick
    });
    Logger.debug(`${client.id}:${req.nick} join ${channelId} channel`, this.onChatConnect.name);
  }

  /** 
   * 클라이언트 채팅
   * - 채널내 채팅 전송
   * - 채널내 귀속말 전송
   * @param socket - socket.io socket
   * @param req - received data
   */
  public async onChatSend(client: Socket, req: ChatSendDTO) {
    Logger.debug(`${JSON.stringify(req)}`, this.onChatSend.name);
    if(client.data.nick === undefined) {
      Logger.warn(`client has not nick!`, this.onChatSend.name);
      client.send({ protocolId: eProtocolId.CS_CHAT_SEND, result: eResultCode.USER_NOT_FOUND });
      return client.disconnect();
    }
    
    const userId = client.id;
    const channelId = req.channel;
    const message = req.message;
    client.send({ protocolId: eProtocolId.CS_CHAT_SEND, result: eResultCode.SUCCESS });

    const profile = await this.getUserProfile(userId, client.data.nick);

    const {channelType, channelBody} = ChannelID.parse(channelId);
    if (channelType != ChannelType.Whisper) {
      client.to(channelId.toString()).emit('message', {
        protocolId: eProtocolId.PC_CHAT_SEND,
        result: eResultCode.SUCCESS,
        type: channelType,
        eChatMsgType: req.eChatMsgType,
        profile: profile,
        message: message,
        whisper: ChannelID.make(ChannelType.Whisper, Number(userId)),
        time: new Date().getTime(),
      });
    }
    else {
      let sendMessage = {
        protocolId: eProtocolId.PC_CHAT_SEND,
        result: eResultCode.SUCCESS,
        type: channelType,
        channel: req.channel,
        eChatMsgType: req.eChatMsgType,
        profile: profile,
        message: message,
        whisper: ChannelID.make(ChannelType.Whisper, Number(userId)),
        time: new Date().getTime(),
      };
      client.send(sendMessage);
      this.socketService.emitRoom(channelId.toString(), sendMessage);
    }
  }

  /** 
   * 채널 변경
   * @param socket - socket.io socket
   * @param req - received data
   */
  public async onChatChannel(client: Socket, req: ChatChannelDTO) {
    Logger.debug(`${JSON.stringify(req)}`, this.onChatChannel.name);
    if(client.data.nick === undefined) {
      Logger.warn(`client has not nick!`, this.onChatChannel.name);
      client.send({ protocolId: eProtocolId.CS_CHAT_CHANNEL, result: eResultCode.USER_NOT_FOUND });
      return client.disconnect();
    }

    const oldChannel = client.data.wd as number;
    await client.leave(oldChannel.toString());

    const newChannelId = ChannelID.make(ChannelType.World, req.channel);
    await client.join(newChannelId.toString());
    client.data.wd = newChannelId;

    client.send({ 
      protocolId: eProtocolId.CS_CHAT_CHANNEL, 
      result: eResultCode.SUCCESS, 
      type: ChannelType.World, 
      channel: newChannelId, 
      name: req.channel 
    });
  }

  /** 
   * 채널 내 유저 검색
   * @param socket - socket.io socket
   * @param req - received data
   */
  public async onChatUserList(client: Socket, req: ChatUserListDTO) {
    Logger.debug(`${JSON.stringify(req)}`, this.onChatUserList.name);
    if(client.data.nick === undefined) {
      Logger.warn(`client has not nick!`, this.onChatUserList.name);
      client.send({ protocolId: eProtocolId.CS_CHAT_USERLIST, result: eResultCode.USER_NOT_FOUND });
      return client.disconnect();
    }

    const channelId = req.channel;
    const members = this.socketService.getRoomMembers(channelId.toString());
    client.send({ protocolId: eProtocolId.CS_CHAT_USERLIST, result: eResultCode.SUCCESS, list: members });
  }

  /** 
   * 유저 정보 로드
   * - Mysql에서 정보 로드
   * @param userSeq - user unique number
   * @returns user profile object
   */
  private async getUserProfile(userId: string, nick: string) {
    //return await this.mysqlService.getUserProfile(userSeq);
    return { userId, nick };
  }

  /** 
   * 월드 채널 검색
   * @returns 최소 인원 채널 번호
   */
  private async getWorldChannel() {
    let res = 0;
    let opt = [80, 130, 180, 230, 280, 330];
    for (let i = 0; i < opt.length; i++) {
      res = await this.role(opt[i]);
      if (res !== undefined)
        break;
    }
    return res;
  }

  private async role(limit: number): Promise<number |undefined> {
    let res = undefined;
    for (let i = 0; i < 999; i++) {
      let channel = ChannelID.make(ChannelType.World, i);
      let sockets = this.socketService.getRoomMembers(channel.toString());
      let socketCount = sockets.length;
      if (socketCount < limit) {
        res = i;
        break;
      }
    }
    return res;
  }
}