import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatLobbyService } from './chatlobby.service';
import { SocketService } from 'src/common/socket.service';

@Module({
  imports: [],
  providers: [ 
    ChatGateway,
    ChatLobbyService,
    SocketService
  ],
})
export class ChatModule {}