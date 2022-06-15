import { Socket } from 'socket.io';
import AMQPRPCClient from '../modules/rpc/amqp-rpc/AMQPRPCClient';

export enum MediaSoupSocket {
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

export interface SocketRPCType extends Socket {
  rpcClient?: AMQPRPCClient;
}
