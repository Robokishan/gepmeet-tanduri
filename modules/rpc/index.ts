import { rabbitMQConnection } from '../../client/rabbitmq';
import Logger from '../../utils/logger';
import AMQPRPCClient from './amqp-rpc/AMQPRPCClient';
import AMQPRPCServer from './amqp-rpc/AMQPRPCServer';
import { registerRPCServerHandlers } from './handler';

const log = new Logger();

// NOTE: export rpcserver and rpcclient if required using outside block variable
export const startRPCServer = async (queue: string): Promise<void> => {
  const rpcServer = new AMQPRPCServer(rabbitMQConnection, {
    requestsQueue: queue
  });
  await rpcServer.start();
  registerRPCServerHandlers(rpcServer);
  log.info('RPC server loaded');
};

export const startRPCClient = async (queue: string): Promise<AMQPRPCClient> => {
  const rpcClient = new AMQPRPCClient(rabbitMQConnection, {
    requestsQueue: queue
  });
  await rpcClient.start();
  return rpcClient;
};
