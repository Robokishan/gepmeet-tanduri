import redis from '../../client/redis';

const SEPRATER = ':';

const getRoomHashKey = (roomId: string, workerId: string, userId: string) =>
  `${roomId}:${workerId}:${userId}`;
const getWorkerIdsKey = () => 'WORKERS:IDS';

const seprateKeys = (key: string): Array<string> => {
  return key.split(SEPRATER);
};

export const getNewPanchayatWorkers = async () => {
  const workers = await redis.smembers(getWorkerIdsKey());
  return workers;
};

export const getUserPanchayatWorker = async (
  roomId: string,
  userId: string
): Promise<string> => {
  try {
    const RoomHashKey = getRoomHashKey(roomId, '*', userId);
    const [, workerKey] = await redis.sscan(RoomHashKey, 0);
    const [, worker] = seprateKeys(workerKey[0]);
    return worker;
  } catch (error) {
    return null;
  }
};
