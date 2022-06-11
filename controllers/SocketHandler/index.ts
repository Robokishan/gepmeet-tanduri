import { Socket } from 'socket.io';
import { SocketRPCType } from '../../utils/types';
import {
  CleanupSockerHandlers,
  MediasoupSocketHandlers
} from './Mediasoup/helper';

export const registerMediasoupHandlers = (socket: Socket) => {
  MediasoupSocketHandlers().forEach((helper) => {
    socket.on(helper.eventName, helper.handler);
  });
};

export const cleanupSocketsHandlers = (socket: SocketRPCType) => {
  CleanupSockerHandlers().forEach((helper) => {
    socket.on(helper.eventName, helper.handler);
  });
};
