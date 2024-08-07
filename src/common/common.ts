export const enum eServerType {
  WebServer = 1,
  ChatServer = 2,
};

export class ServerInfo {
  type: eServerType;
  ip: string;
  port: number;
  count: number;
  time: number;  
}

export const enum ChannelType {
  World = 0,
  Whisper = 1,
  Party = 2,
};

const enum ChannelHead {
  World = 'wd',
  Whisper = 'wr',
  Party = 'pt',
};

export class ChannelID {
  public static make(type: ChannelType, id: number): number {
    let result = 0;
    switch(type) {
    case ChannelType.World: 
      result = parseInt(ChannelHead.World + id, 36); 
      break;
    case ChannelType.Whisper: 
      result = parseInt(ChannelHead.Whisper + id, 36); 
      break;
    case ChannelType.Party: 
      const now = (new Date().getTime() / 1000).toString();
      result = parseInt(ChannelHead.Party + now.slice(5) + id, 36); 
      break;
    }
    return result;
  }

  public static parse(id: any): { channelType: ChannelType, channelBody: number } {
    const temp1 = parseInt(id);
    const temp2 = temp1.toString(36);    
    const head = temp2.slice(0, 2);
    const channelBody = parseInt(temp2.slice(2));

    let channelType: ChannelType = ChannelType.World;
    switch(head) {
    case ChannelHead.Whisper: 
      channelType = ChannelType.Whisper; 
      break;
    case ChannelHead.Party: 
      channelType = ChannelType.Party; 
      break;
    }
    return { channelType, channelBody };
  }
}

export const enum eRedisDatabase {
  BASE = 0,
  CHAT = 1,
  PUBSUB = 2,
}
  
export const eRedisKey = {
  GAMETOKEN: 'GAMETOKEN:',
  PROFILE: 'PROFILE:M',
}
