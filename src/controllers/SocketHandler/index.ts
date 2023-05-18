import { Socket } from 'socket.io';
import { SocketRPCType } from '../../utils/types';
import {
  CleanupSockerHandlers,
  genericSocketHandlers,
  LeaveRoomHandlers,
  MediasoupSocketHandlers
} from './Mediasoup/helper';

export const registerGenericHandlers = (socket: Socket) => {
  genericSocketHandlers().forEach((helper) => {
    socket.on(helper.eventName, helper.handler);
  });
};

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

export const cleanupRoomHandler = (socket: SocketRPCType) => {
  LeaveRoomHandlers().forEach((helper) => {
    socket.on(helper.eventName, helper.handler);
  });
};

export const removeRoomEvents = (socket: SocketRPCType) => {
  LeaveRoomHandlers().forEach((helper) => {
    socket.off(helper.eventName, helper.handler);
  });

  MediasoupSocketHandlers().forEach((helper) => {
    socket.off(helper.eventName, helper.handler);
  });
};
