import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { profile } from 'console';
import * as mysql from 'mysql2/promise';
import {RowDataPacket} from 'mysql2';

const enum DatabaseType {
  GLOBAL = "global",
  GAME1 = "game1",
  ADMIN = "admin"
}

@Injectable()
export class MysqlService {
  private pools: Record<string, mysql.Pool>;
  
  constructor(private configService: ConfigService) { 
    this.pools = { };
  }

  private async getClient(type: DatabaseType) {
    const config = this.configService.get('mysql');
    if(this.pools[type] === undefined) {
      let client: mysql.Pool;
      switch(type) {
        case DatabaseType.GLOBAL: client = mysql.createPool(config.global); break;
        case DatabaseType.GAME1: client = mysql.createPool(config.game1); break;
        case DatabaseType.ADMIN: client = mysql.createPool(config.admin); break;
      }
      if(client === undefined) 
        throw new Error(`mysql client type error : ${type}`);  

      this.pools[type] = client;
    }
    return await this.pools[type].getConnection();
  }

  private async query(type: DatabaseType, sql: string) {
    const conn = await this.getClient(type);
    let result: RowDataPacket[];
    try {
      const [rows] = await conn.query<RowDataPacket[]>(sql);
      result = rows;
    }
    catch(err) {
      throw err;
    }
    finally {
      conn.release();
    }
    return result;
  }

  public async getUserProfile(userSeq: number) {
    try {
      const profile = {
        userSeq: userSeq,
        nick: `User${userSeq}`,
        wealth: null,
        item: null,
      };
      const gamedb = await this.getClient(DatabaseType.GAME1);
      try {
        const queryWealth = mysql.format('SELECT * FROM tb_wealth WHERE USER_SEQ = ? LIMIT 1;', [userSeq]);
        profile.wealth = await gamedb.query(queryWealth).then(rows => rows[0][0]);
        const queryItem = mysql.format('SELECT * FROM tb_item WHERE USER_SEQ = ? LIMIT 1;', [userSeq]);
        profile.item = await gamedb.query(queryItem).then(rows => rows[0][0]);
      }
      catch(err) { throw err; }
      finally { gamedb.release(); }
      return profile;
    }
    catch(err) {
      Logger.error(`getUserProfile error ${err}`, `MysqlService`);
    }
  }
}