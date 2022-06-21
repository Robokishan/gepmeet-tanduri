import { ConsumeMessage } from 'amqplib';
import { io } from '../liveDhokla';

export const onRoomEvents = async (msg: ConsumeMessage | null) => {
  const roomId = msg.fields.routingKey.split(':')[1];
  io.to(roomId).emit('roomevents', JSON.parse(msg.content.toString()));
};
