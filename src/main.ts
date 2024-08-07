import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LogLevel } from '@nestjs/common/services/logger.service';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './adapters/socket-io.adapters';
import { join } from 'path';

async function bootstrap() {
  const levels: LogLevel[] = process.env.NODE_ENV == 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'];
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: levels
  });
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(parseInt(process.env.WEB_PORT, 10) || 3000);
}
bootstrap();
