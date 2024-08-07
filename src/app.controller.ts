import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  
  @Get()
  root(): string {
    return 'Hello Stranger';
  }
}

@Controller('health')
export class HealthController {
  constructor() { }

  @Get()
  health(): string {
    return "Ok";
  }
}

@Controller('chat')
export class ChatController {
  constructor() { }

  @Get()
  @Render('chat')
  root() {
    return { };
  }
}