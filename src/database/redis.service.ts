import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import { eRedisDatabase, eRedisKey } from 'src/common/common';

@Injectable()
export class RedisService {
  private clients: Record<string, any>;
  
  constructor(private configService: ConfigService) { 
    this.clients = { };
  }

  private async getClient(type: eRedisDatabase): Promise<any> {
    const config = this.configService.get('redis');
    if(this.clients[type] === undefined) {
      let client = undefined;
      switch(type) {
        case eRedisDatabase.BASE: client = redis.createClient(config.base); break;
        case eRedisDatabase.CHAT: client = redis.createClient(config.chat); break;
        case eRedisDatabase.PUBSUB: client = redis.createClient(config.pubsub); break;
      }      
      if(client === undefined) 
        throw new Error(`redis client type error : ${type}`);     

      client.on('error', (err: any) => Logger.error('Redis error', type, err));
      await client.connect();

      this.clients[type] = client;
    }
    return this.clients[type];
  }

  public async getGuildChannel(guildId: string): Promise<{ ip: string, port: number }> {
    try {
      const client = await this.getClient(eRedisDatabase.BASE);
      const data = await client.get('GVG:CHANNEL:' + guildId);
      return JSON.parse(data);
    }
    catch(err) {
      Logger.error(`getGuildChannel error ${err}`, `RedisService`);
    }
  }

  public async setGuildChannel(guildId: string, addr: { ip: string, port: number }) {
    try {
      const client = await this.getClient(eRedisDatabase.BASE);
      await client.set('GVG:CHANNEL:' + guildId, addr);
    }
    catch(err) {
      Logger.error(`getGuildChannel error ${err}`, `RedisService`);
    }
  }

  public async getUserProfile(userSeq: string) {
    try {
      const client = await this.getClient(eRedisDatabase.BASE);
      const data = await client.hGet(eRedisKey.PROFILE, userSeq);
      return JSON.parse(data);
    }
    catch(err) {
      Logger.error(`getUserProfile error ${err}`, `RedisService`);
    }
  }

  public async setUserProfile(userSeq: string, profile: any) {
    try {
      const client = await this.getClient(eRedisDatabase.BASE);
      await client.hSet(eRedisKey.PROFILE, userSeq, profile);
    }
    catch(err) {
      Logger.error(`setUserProfile error ${err}`, `RedisService`);
    }
  }
}