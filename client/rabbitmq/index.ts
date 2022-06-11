import amqp, { Connection } from 'amqplib';
import config from '../../config/config';
// import { startRPCServer } from '../../modules/rpc';
import Logger from '../../utils/logger';

const log = new Logger();
const retryInterval = 5000;

let rabbitMQConnection = null;

const startRabbit = async () => {
  let conn: Connection = null;
  try {
    conn = await amqp.connect(config.RABITMQ_URL);
    conn.on('close', async function (err: Error) {
      log.error('Rabbit connection closed with error: ', err);
      setTimeout(async () => await startRabbit(), retryInterval);
    });
    rabbitMQConnection = conn;
    log.info(`Rabbitmq Connection Successfull`);
    // await startRPCServer(conn, 'gepmeet-tanduri');
  } catch (error) {
    log.error(error);
  }

  return conn;
};

export { rabbitMQConnection, startRabbit };
