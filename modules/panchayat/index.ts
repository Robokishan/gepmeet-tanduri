import redis from '../../client/redis';
import Logger from '../../utils/logger';

const SEPRATER = ':';

const getRoomHashKey = (roomId: string, workerId: string, userId: string) =>
  `${roomId}${SEPRATER}${SEPRATER}${userId}`;
const getWorkerIdsKey = () => `WORKERS${SEPRATER}IDS`;

const log = new Logger();
// const seprateKeys = (key: string): Array<string> => {
//   return key.split(SEPRATER);
// };

export const getNewPanchayatWorkers = async (): Promise<string[]> => {
  const workers = await redis.smembers(getWorkerIdsKey());
  return workers;
};

export const getUserPanchayatWorker = async (
  roomId: string,
  userId: string
): Promise<string> => {
  try {
    const RoomHashKey = getRoomHashKey(roomId, '*', userId);
    const worker = await redis.hget(RoomHashKey, 'workerId');
    return worker;
  } catch (error) {
    log.error(error);
    return null;
  }
};

export const saveUserPanchayatWorker = async (
  roomId: string,
  workerId: string,
  userId: string,
  socketId: string
): Promise<void> => {
  try {
    const RoomHashKey = getRoomHashKey(roomId, workerId, userId);
    await redis.hmset(RoomHashKey, {
      workerId,
      roomId,
      userId,
      socketId
    });
  } catch (error) {
    log.error(error);
  }
};

export const deleteUserPanchayatWorker = async (
  roomId: string,
  workerId: string,
  userId: string
) => {
  try {
    const RoomHashKey = getRoomHashKey(roomId, workerId, userId);
    await redis.del(RoomHashKey);
  } catch (error) {
    log.error(error);
  }
};
