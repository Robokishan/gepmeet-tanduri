import Logger from '../../../utils/logger';
import AMQPRPCClient from '../amqp-rpc/AMQPRPCClient';

export default class RpcClient {
  rpcClient: AMQPRPCClient;
  log: Logger;
  onError;

  constructor(rpcClient: AMQPRPCClient) {
    this.rpcClient = rpcClient;
    this.log = new Logger();
  }
  async sendCommand(
    command: string,
    workerId: string,
    args = []
  ): Promise<unknown> {
    try {
      return await this.rpcClient.sendCommand(command, args, workerId);
    } catch (error) {
      this.log.error({ error, command });
      // this.onError();
      // throw new Error(error);
    }
  }

  disconnect() {
    this.rpcClient.disconnect();
  }
}
