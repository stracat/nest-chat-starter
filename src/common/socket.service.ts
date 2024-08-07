import { Injectable, Logger } from "@nestjs/common";
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketService {
  public server: Server = null;

  constructor() {
  }

  public newClient(client: Socket) {
    Logger.log(`websocket connected. id: ${client.id}, ip: ${client.request.socket.remoteAddress}`, `SocketService`);
  }

  public deleteClient(client: Socket) {
    Logger.log(`websocket disconnected ${client.id}`, `SocketService`);
  }

  public getSocketCount(): number {
    return this.server.sockets.sockets.size;
  }

  public getRoomCount(): number {
    return this.server.sockets.adapter.rooms.size;
  }

  /** 
   * Room 내의 유저 목록 검색
   * @param roomId - room id
   * @returns socket userSeq array
   */
  public getRoomMembers(roomId: string) {
    const userList: number[] = [];
    const room = this.server.sockets.adapter.rooms.get(roomId);    
    if(room) {
      for(let key of room) {
        const client = this.server.sockets.sockets.get(key);   
        if(client && client.data.userSeq) 
          userList.push(client.data.userSeq);
      }
    }    
    return userList;
  }

  /** 
   * Room 내의 유저 검색   
   * @param roomId - room id
   * @param userSeq - user key
   * @returns socket.io socket
   */
   public getRoomMember(roomId: string, userSeq: number): Socket | undefined {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if(room) {
      for(let key of room) {
        const client = this.server.sockets.sockets.get(key);
        if(client && client.data.userSeq === userSeq) 
          return client;
      }
    }
    return undefined;
  }

  /** 
   * 전체 소켓 유저 검색
   * - 특정 유저를 검색할 때 귓속말 채널의 멤버 검색이 더 효율적이다.
   * @param userSeq - user key
   * @returns socket.io socket
   */
  public getMember(userSeq: number): Socket | undefined {
    for(let id in this.server.sockets.sockets) {
      if(this.server.sockets.sockets[id].data.userSeq == userSeq) {
        return this.server.sockets.sockets[id];
      }
    }
    return undefined;
  }  

  /** 
   * 전체 전송
   * @param data - send data
   */
  public notice(data: any) {
    this.server.emit('message', data);  
  }

  /** 
   * 룸 전송
   * @param roomId - room id
   * @param data - send data
   */
  public emitRoom(roomId: string, data: any) {
    this.server.to(roomId).emit('message', data);  
  }
}
