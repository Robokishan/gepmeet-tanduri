import redis from '../../client/redis';
import Logger from '../../utils/logger';

const SEPRATER = ':';

const getRoomHashKey = (roomId: string, workerId: string, userId: string) =>
  `${roomId}${SEPRATER}${workerId}${SEPRATER}${userId}`;
const getWorkerIdsKey = () => `WORKERS${SEPRATER}IDS`;

const log = new Logger();
const seprateKeys = (key: string): Array<string> => {
  return key.split(SEPRATER);
};

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
    const [, workerKey] = await redis.scan(0, 'MATCH', RoomHashKey);
    const [, worker] = seprateKeys(workerKey[0]);
    return worker;
  } catch (error) {
    return null;
  }
};

export const saveUserPanchayatWorker = async (
  roomId: string,
  workerId: string,
  userId: string
): Promise<void> => {
  try {
    const RoomHashKey = getRoomHashKey(roomId, workerId, userId);
    await redis.hmset(RoomHashKey, {
      workerId,
      roomId,
      userId
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
