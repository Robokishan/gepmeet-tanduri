import { Channel } from 'amqplib';
import { QUEUE_ROOM_EVENTS } from '../../utils/constant';
import { ROOM_EXCHANGE } from '../../utils/constant';

export const createExchanges = async (channel: Channel) => {
  await channel.assertExchange(ROOM_EXCHANGE, 'direct', {
    autoDelete: true
  });
};

export const createQueues = async (channel: Channel) => {
  await channel.assertQueue(QUEUE_ROOM_EVENTS, {
    // durable: false
  });
};
