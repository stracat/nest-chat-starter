import { Injectable, Logger } from '@nestjs/common';
import { PubSubRedisService } from 'src/database/pubsub.redis.service';
import { eServerType, ServerInfo } from './common';
import { SocketService } from './socket.service';
import { eServerProtocol } from './server.protocol';
import { SsServerOn, SsServerPing } from './server.protocol.dto';

@Injectable()
export class ServerService {
  private servers: Record<string, ServerInfo>;
  private serverInfo: ServerInfo;
  private startTime: number;
  private pingTimer: any;

  constructor(private readonly redisService: PubSubRedisService, 
    private readonly socketService: SocketService) {
    this.servers = {};
  }

  public async registerServer(serverType: eServerType, port: number)
  {
    this.serverInfo = {
      type: serverType,
      ip: this.getIPAddress(),
      port: port,
      count: 0,
      time: 0
    };
    this.startTime = (new Date()).getTime();

    // Redis 구독기능(pub/sub)를 활용한 서버간 통신 처리
    // 1. 서버간 통신 채널 구독
    // 2. 서버에 신규 접속 알림
    // 3. 서버에 일정간격(60초)으로 서버 상태 알림
    await this.redisService.subscribeServer((message) => {
      switch(message.protocol) {
        case eServerProtocol.SS_SERVER_ON:   this.onSsServerOn(message);   break;
        case eServerProtocol.SS_SERVER_PING: this.onSsServerPing(message); break;
      }
    });

    await this.redisService.publishServer({
      ...this.serverInfo,
      protocol: eServerProtocol.SS_SERVER_ON
    } as SsServerOn);

    this.pingTimer = setInterval(async () => {
      let time = (new Date()).getTime();
      this.serverInfo.count = this.socketService.getSocketCount();
      this.serverInfo.time = time - this.startTime;

      await this.redisService.publishServer({
        ...this.serverInfo,
        protocol: eServerProtocol.SS_SERVER_PING
      } as SsServerPing);
    }, 30000);
  }

  public getIPAddress() {
    let interfaces = require('os').networkInterfaces();
    for (let name in interfaces) {
      if (name.indexOf('vEthernet', 0) >= 0) 
        continue;
      let iface = interfaces[name];  
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
    return '0.0.0.0';
  }

  public onSsServerOn(message: SsServerOn) {
    const thisKey = this.serverInfo.ip + ':' + this.serverInfo.port;
    const key = message.ip + ':' + message.port;
    if (key == thisKey) return;

    this.servers[key] = {
      type: message.type,
      ip: message.ip,
      port: message.port,
      count: message.count, 
      time: message.time 
    };
    Logger.log(`${message.type} ${key} server online`, `ServerService`);
  }

  public onSsServerPing(message: SsServerPing) {
    const thisKey = this.serverInfo.ip + ':' + this.serverInfo.port;
    const key = message.ip + ':' + message.port;
    if (key == thisKey) return;

    if(this.servers[key]) {
      this.servers[key].count = message.count;
      this.servers[key].time = message.time;
    }
    else {
      this.servers[key] = {
        type: message.type,
        ip: message.ip,
        port: message.port,
        count: message.count, 
        time: message.time 
      };
      Logger.log(`${message.type} ${key} server online`, `ServerService`);
    }    
  }

  public getMinimumServer(type: eServerType): ServerInfo | undefined {
    let selectedServer: ServerInfo = undefined;
    // 최소조건을 만족하는 서버 선택
    const minimum = 100;
    for(const key in this.servers) {
      const svr = this.servers[key];
      if(svr.type == type && svr.count < minimum) {
        selectedServer = svr;
        break;
      }
    }    
    // 가장 작은 서버 선택
    if(selectedServer == undefined) {
      for(const key in this.servers) {
        const svr = this.servers[key];
        if(svr.type == type && selectedServer == undefined || svr.count < selectedServer.count) {
          selectedServer = svr;
        }
      }
    }
    return selectedServer;
  }

  public getServer(key: string) {
    return this.servers[key];
  }
}
