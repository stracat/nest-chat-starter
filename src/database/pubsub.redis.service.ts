import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';

@Injectable()
export class PubSubRedisService {
  private readonly RedisServerChannel = "server";
  private pubClient: any;
  private subClient: any;  
  
  constructor(private configService: ConfigService) { 
  }

  private async getPubClient(): Promise<any> {
    const config = this.configService.get('redis');
    if(this.pubClient == undefined) {
      const client = redis.createClient(config.pubsub);
      if(client === undefined) 
        throw new Error(`redis client create error`);

      client.on('error', (err: any) => Logger.error('Redis error', err));
      await client.connect();
      this.pubClient = client;
    }
    return this.pubClient;
  }

  private async getSubClient(): Promise<any> {
    const config = this.configService.get('redis');
    if(this.subClient == undefined) {
      const client = redis.createClient(config.pubsub);
      if(client === undefined) 
        throw new Error(`redis client create error`);

      client.on('error', (err: any) => Logger.error('Redis error', err));
      await client.connect();
      this.subClient = client;
    }
    return this.subClient;
  }

  public async publishServer(message: any) {
    try {
      const client = await this.getPubClient();
      await client.publish(this.RedisServerChannel, JSON.stringify(message));
    }
    catch(err) {
      Logger.error(`publishServer error ${err}`, `RedisService`);
    }
  }

  public async subscribeServer(callback) {
    try {
      const client = await this.getSubClient();
      await client.subscribe(this.RedisServerChannel, (message) => {
        callback(JSON.parse(message));
      });
    }
    catch(err) {
      Logger.error(`subscribeServer error ${err}`, `RedisService`);
    }
  }

  public async unsubscribeServer() {
    try {
      const client = await this.getSubClient();
      await client.unsubscribe(this.RedisServerChannel);
    }
    catch(err) {
      Logger.error(`unsubscribeServer error ${err}`, `RedisService`);
    }
  }
}