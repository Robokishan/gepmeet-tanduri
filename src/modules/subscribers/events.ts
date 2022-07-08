import { ConsumeMessage } from 'amqplib';
import { rabbitMQChannel } from '../../client/rabbitmq';
import { io } from '../liveDhokla';

export const onRoomEvents = async (msg: ConsumeMessage | null) => {
  rabbitMQChannel.ack(msg);
  if (!msg) {
    //skip, it's queue close message
    return;
  }
  const roomId = msg.fields.routingKey.split(':')[1];
  io.to(roomId).emit('roomevents', JSON.parse(msg.content.toString()));
};
