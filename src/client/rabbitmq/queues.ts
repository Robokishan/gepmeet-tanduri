import { Channel } from 'amqplib';
import { QUEUE_ROOM_EVENTS } from '../../utils/constant';

export const createQueues = async (channel: Channel) => {
  await channel.assertQueue(QUEUE_ROOM_EVENTS, {
    // durable: false
  });
};
