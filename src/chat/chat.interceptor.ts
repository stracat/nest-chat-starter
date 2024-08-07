import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(tap(
      () => Logger.debug(`${context.getHandler().name}. ${Date.now() - now}ms`, LoggingInterceptor.name)
    ));
  }
}

@Injectable()
export class UserAuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.getArgByIndex<Socket>(0);
    if(client.data == undefined || client.data.userSeq == undefined) {
      throw new Error('user not auth');
    }
    return next.handle().pipe();
  }
}