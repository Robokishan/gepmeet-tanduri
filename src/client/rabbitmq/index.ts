import amqp, { Channel, Connection } from 'amqplib';
import config from '../../config/config';
// import { startRPCServer } from '../../modules/rpc';
import Logger from '../../utils/logger';
import { createExchanges } from './exchanges';
import { createQueues } from './queues';

const log = new Logger();
const retryInterval = 5000;

let rabbitMQConnection: Connection = null;
let rabbitMQChannel: Channel = null;
const startRabbit = async () => {
  return new Promise((resolve, _reject) => {
    log.info('Rabbitmq Connecting');
    amqp
      .connect(config.RABITMQ_URL)
      .then(async (conn: Connection) => {
        conn.on('close', async (err: Error) => {
          log.error('Rabbit connection closed', err);
        });
        conn.on('error', async (err: Error) => {
          log.error('Rabbit connection error: ', err);
          conn.close();
          conn.removeAllListeners();
          setTimeout(async () => await startRabbit(), retryInterval);
        });
        rabbitMQConnection = conn;
        log.info(`Rabbitmq Connection Successfull`);
        rabbitMQChannel = await conn.createChannel();
        await createQueues(rabbitMQChannel);
        await createExchanges(rabbitMQChannel);
        resolve(conn);
      })
      .catch((err) => {
        log.error(err);
        setTimeout(async () => await startRabbit(), retryInterval);
      });
    // await startRPCServer(conn, 'gepmeet-tanduri');
  });
};

export { rabbitMQConnection, startRabbit, rabbitMQChannel };
