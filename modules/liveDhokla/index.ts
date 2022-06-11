import { Server as SocketServer, ServerOptions } from 'socket.io';
import { Server } from 'http';
import { validateToken } from '../../utils/AuthCheker';
import {
  cleanupSocketsHandlers,
  registerMediasoupHandlers
} from '../../controllers/SocketHandler';

import { SocketRPCType } from '../../utils/types';

const TanduriSocket = (
  httpServer: Server,
  options?: Partial<ServerOptions>
) => {
  const io = new SocketServer(httpServer, { path: '/ws', ...options });

  // server
  io.use((socket, next) => {
    const token = socket.handshake.headers['x-access-token'];
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

export default TanduriSocket;
