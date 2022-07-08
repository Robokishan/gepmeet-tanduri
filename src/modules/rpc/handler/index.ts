import AMQPRPCServer from '../amqp-rpc/AMQPRPCServer';

export interface HelperType {
  eventName: string;
  handler: any;
}

export enum MediaSoupCommand {
  consumeUser = 'consumeUser',
  disconnect = 'disconnect',
  getRouterRtpCapabilities = 'getRouterRtpCapabilities',
  createProducerTransport = 'createProducerTransport',
  connectProducerTransport = 'connectProducerTransport',
  produce = 'produce',
  closePeer = 'closePeer',
  newPeer = 'newPeer',
  consume = 'consume',
  resume = 'resume',
  createConsumerTransport = 'createConsumerTransport',
  connectConsumerTransport = 'connectConsumerTransport',
  joinRoom = 'joinRoom'
}

export const serverhelpers = (): HelperType[] => [
  // {
  //   eventName: MediaSoupCommand.newPeer,
  //   handler: newPeerJoinHandler
  // }
];

export const registerRPCServerHandlers = (server: AMQPRPCServer) => {
  // serverhelpers().forEach((helper) => {
  //   server.addCommand(helper.eventName, helper.handler);
  // });
};
