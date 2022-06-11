import redis from '../../../client/redis';
import { REDIS_KEY_SOCKET_PREFIX } from '../../../utils/constant';

// store uses redis aggresively if things goes down then choose nodejs memory to store room data
const getDhoklaSessionKey = (socketId: string) =>
  REDIS_KEY_SOCKET_PREFIX + socketId;

// second expire time
const SECONDS_EXPIRE_TIME = 1 * 60 * 60 * 24; //1 day

// expire middlware to run always
const middlware = (key: string) => {
  redis.expire(key, SECONDS_EXPIRE_TIME);
};

export const saveSessiondata = async (
  socketId: string,
  data: Record<string, unknown>
) => {
  const key = getDhoklaSessionKey(socketId);
  await redis.set(key, JSON.stringify(data));
  middlware(key);
};

export const upsertSessionData = async (
  socketid: string,
  data: Record<string, unknown>
) => {
  const key = getDhoklaSessionKey(socketid);
  let upsert_data = await redis.get(key);
  if (!upsert_data) upsert_data = JSON.stringify(data);
  else {
    const __d = JSON.parse(upsert_data);
    upsert_data = JSON.stringify({
      ...__d,
      data
    });
  }
  redis.set(key, upsert_data);
  middlware(key);
};

export const getSessionData = async (socketId: string) => {
  const key = getDhoklaSessionKey(socketId);
  const data = await redis.get(key);
  middlware(key);
  return JSON.parse(data);
};

export const deleteSessionData = async (socketId: string) => {
  await redis.del(getDhoklaSessionKey(socketId));
};
