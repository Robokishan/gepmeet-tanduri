import { Connection } from 'amqplib';
import { PANCHAYAT_EXCHANGE } from '../../utils/constant';
import Logger from '../../utils/logger';
import AMQPRPCClient from './amqp-rpc/AMQPRPCClient';
import AMQPRPCServer from './amqp-rpc/AMQPRPCServer';
import RpcClient from './api';
import { registerRPCServerHandlers } from './handler';

const log = new Logger();

// NOTE: export rpcserver and rpcclient if required using outside block variable
export const startRPCServer = async (
  queue: string,
  connection: Connection
): Promise<void> => {
  const rpcServer = new AMQPRPCServer(connection, {
    requestsQueue: queue
  });
  await rpcServer.start();
  registerRPCServerHandlers(rpcServer);
  log.info('RPC server loaded');
};

export const startRPCClient = async (
  connection: Connection
): Promise<RpcClient> => {
  const rpcClient = new AMQPRPCClient(connection, {
    requestsQueue: '',
    exchange: PANCHAYAT_EXCHANGE
  });

  await rpcClient.start();
  const rpcclient = new RpcClient(rpcClient);
  return rpcclient;
};
