import { Socket } from 'socket.io';
import RpcClient from '../modules/rpc/api';

export enum MediaSoupSocket {
  consumeUser = 'consumeUser',
  newConsumer = 'newConsumer',
  listenConsumers = 'listenConsumers',
  startNegotiation = 'startNegotiation',
  roomAssigned = 'roomAssigned',
  getRouterRtpCapabilities = 'getRouterRtpCapabilities',
  createProducerTransport = 'createProducerTransport',
  connectProducerTransport = 'connectProducerTransport',
  produce = 'produce',
  consume = 'consume',
  resume = 'resume',
  createConsumerTransport = 'createConsumerTransport',
  connectConsumerTransport = 'connectConsumerTransport'
}

export enum UserState {
  JOINED = 'JOINED',
  DISCONNECTED = 'DISCONNECTED',
  JOINING = 'JOININIG',
  ERROR = 'ERROR'
}

export interface SocketRPCType extends Socket {
  rpcClient?: RpcClient;
  userState?: UserState;
}
