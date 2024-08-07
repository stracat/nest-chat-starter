import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatLobbyService } from './chatlobby.service';
import { SocketService } from 'src/common/socket.service';
import { eProtocolId, eResultCode } from 'src/common/chat.protocol';
import { ChatChannelDTO, ChatConnectDTO, ChatSendDTO, ChatUserListDTO } from 'src/common/chat.protocol.dto';
import { LoggingInterceptor } from './chat.interceptor';
import { eServerType } from 'src/common/common';

const webPort = parseInt(process.env.WEB_PORT, 10) || 3000;
const socketPort = parseInt(process.env.WEBSOCKET_PORT, 10) || 5000;

@WebSocketGateway(socketPort, { cors: { origin: `http://localhost:${webPort}` } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private socketService: SocketService,
    private readonly lobbyService: ChatLobbyService) {
  }

  public afterInit(server: Server) {
    this.socketService.server = server;
  }

  public handleConnection(client: Socket, ..._args: any[]) {
    this.socketService.newClient(client);
  }

  public handleDisconnect(client: Socket) {
    this.socketService.deleteClient(client);
  }
  
  @SubscribeMessage(eProtocolId.CS_CHAT_PING)
  onChatPing(client: Socket) {
    client.send({ protocolId: eProtocolId.CS_CHAT_PING });
  }

  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(eProtocolId.CS_CHAT_CONNECT)
  async onChatConnect(client: Socket, req: ChatConnectDTO) {  
    await this.lobbyService.onChatConnect(client, req);
  }

  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(eProtocolId.CS_CHAT_SEND)
  async onChatSend(client: Socket, req: ChatSendDTO) {  
    await this.lobbyService.onChatSend(client, req);
  }

  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(eProtocolId.CS_CHAT_CHANNEL)
  async onChatChannel(client: Socket, req: ChatChannelDTO) {  
    await this.lobbyService.onChatChannel(client, req);
  }

  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(eProtocolId.CS_CHAT_USERLIST)
  async onChatUserList(client: Socket, req: ChatUserListDTO) {  
    await this.lobbyService.onChatUserList(client, req);
  }
}