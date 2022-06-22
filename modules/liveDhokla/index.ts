import { Server as SocketServer, ServerOptions } from 'socket.io';
import { Server } from 'http';
import { validateToken } from '../../utils/AuthCheker';
import {
  cleanupSocketsHandlers,
  registerMediasoupHandlers
} from '../../controllers/SocketHandler';

import { SocketRPCType } from '../../utils/types';
import cookie from 'cookie';

let io: SocketServer = null;
const TanduriSocket = (
  httpServer: Server,
  options?: Partial<ServerOptions>
) => {
  io = new SocketServer(httpServer, { path: '/ws', ...options });

  // server
  io.use((socket, next) => {
    const token = cookie.parse(socket.handshake.headers?.cookie)?.token;
    if (token && validateToken(token as string).isValidToken === true) {
      next();
    } else {
      next(new Error('Socket authentication error'));
    }
  });

  io.on('connection', (socket: SocketRPCType) => {
    registerMediasoupHandlers(socket);
    cleanupSocketsHandlers(socket);
  });
};

export { TanduriSocket, io };
