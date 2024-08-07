import { PartialType } from '@nestjs/mapped-types';
import { ServerInfo } from './common';
import { eServerProtocol } from './server.protocol';

export class SsServerOn extends PartialType(ServerInfo) {
  protocol: eServerProtocol = eServerProtocol.SS_SERVER_ON;
}

export class SsServerPing extends PartialType(ServerInfo) {
  protocol: eServerProtocol = eServerProtocol.SS_SERVER_PING;
}
