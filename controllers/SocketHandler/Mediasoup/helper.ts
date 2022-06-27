import Logger from '../../../utils/logger';
import { MediaSoupSocket, SocketRPCType } from '../../../utils/types';
import {
  connectConsumerTransportHandler,
  connectProducerTransportHandler,
  createConsumerTransportHandler,
  createProducerTransportHandler,
  getRTPCapabilitiesHandler,
  handlerDisconnect,
  mediaconsumeHandler,
  mediaproduceHandler,
  mediaResume,
  mediaUserConsumeHandler,
  roomOnUserDrag,
  startNegotiationHandler
} from './handler';

export type handlerFunc = (
  this: SocketRPCType,
  _data: unknown,
  callback: any,
  sessionData?: any
) => void;
export interface SocketHandlerType {
  handler: handlerFunc;
  eventName: string;
}

const log = new Logger();
export const MediasoupSocketHandlers = (): SocketHandlerType[] => [
  {
    eventName: MediaSoupSocket.startNegotiation,
    handler: startNegotiationHandler
  },
  {
    eventName: MediaSoupSocket.getRouterRtpCapabilities,
    handler: getRTPCapabilitiesHandler
  },
  {
    eventName: MediaSoupSocket.createProducerTransport,
    handler: createProducerTransportHandler
  },
  {
    eventName: MediaSoupSocket.connectProducerTransport,
    handler: connectProducerTransportHandler
  },
  {
    eventName: MediaSoupSocket.produce,
    handler: mediaproduceHandler
  },
  {
    eventName: MediaSoupSocket.createConsumerTransport,
    handler: createConsumerTransportHandler
  },
  {
    eventName: MediaSoupSocket.connectConsumerTransport,
    handler: connectConsumerTransportHandler
  },
  {
    eventName: MediaSoupSocket.consume,
    handler: mediaconsumeHandler
  },
  {
    eventName: MediaSoupSocket.resume,
    handler: mediaResume
  },
  {
    eventName: MediaSoupSocket.consumeUser,
    handler: mediaUserConsumeHandler
  },
  {
    eventName: 'drag',
    handler: roomOnUserDrag
  }
];

export const CleanupSockerHandlers = (): SocketHandlerType[] => [
  {
    eventName: 'connect_error',
    handler: (err) => log.error('client connection error', err)
  },
  {
    eventName: 'connect_failed',
    handler: (err) => log.error('client connection error', err)
  },
  {
    eventName: 'disconnecting',
    handler: handlerDisconnect
  },
  {
    eventName: 'leaveroom',
    handler: handlerDisconnect
  }
];
