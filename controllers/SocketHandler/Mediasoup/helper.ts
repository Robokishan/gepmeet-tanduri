import { deleteSessionData } from '../../../modules/liveDhokla/dhoklaStore';
import Logger from '../../../utils/logger';
import { MediaSoupSocket, SocketRPCType } from '../../../utils/types';
import { getRTPCapabilitiesHandler, startNegotiationHandler } from './handler';

export interface SocketHandlerType {
  handler: (this: SocketRPCType, _data: unknown, callback: any) => void;
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
    handler: (data) => log.info(data)
  },
  {
    eventName: MediaSoupSocket.connectProducerTransport,
    handler: (data) => log.info(data)
  },
  {
    eventName: MediaSoupSocket.produce,
    handler: (data) => log.info(data)
  },
  {
    eventName: MediaSoupSocket.createConsumerTransport,
    handler: (data) => log.info(data)
  },
  {
    eventName: MediaSoupSocket.connectConsumerTransport,
    handler: (data) => log.info(data)
  },
  {
    eventName: MediaSoupSocket.consume,
    handler: (data) => log.info(data)
  },
  {
    eventName: MediaSoupSocket.resume,
    handler: (data) => log.info(data)
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
    handler: async function (this: SocketRPCType, err: unknown) {
      //  disconnect and cleanup function should be more clear
      if (this.rpcClient) await this.rpcClient.disconnect();
      deleteSessionData(this.id);
      log.info('client disconnected', err, this.id);
    }
  }
];
