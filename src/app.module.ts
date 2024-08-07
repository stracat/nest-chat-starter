import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController, ChatController, HealthController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule }  from './chat/chat.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ChatModule, 
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
  ],
  controllers: [AppController, HealthController, ChatController],
  providers: [
    AppService
  ],
})
export class AppModule {}
