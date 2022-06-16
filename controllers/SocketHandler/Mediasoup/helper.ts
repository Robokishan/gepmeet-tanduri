import {
  deleteSessionData,
  getSessionData
} from '../../../modules/liveDhokla/dhoklaStore';
import {
  deleteUserPanchayatWorker,
  getUserPanchayatWorker
} from '../../../modules/panchayat';
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
    eventName: 'disconnect',
    handler: handlerDisconnect
  }
];
