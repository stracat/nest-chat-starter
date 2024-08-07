import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChatConnectDTO {
  @IsNotEmpty()
  nick: string;
}

export class ChatSendDTO {
  @IsNotEmpty()
  channel: number;
  @IsNotEmpty()
  message: string;
  @IsNotEmpty()
  eChatMsgType: number;
}

export class ChatChannelDTO {
  @IsNotEmpty()
  channel: number;
}

export class ChatUserListDTO {
  @IsNotEmpty()
  channel: number; 
}
