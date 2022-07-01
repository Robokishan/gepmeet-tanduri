import Redis, { RedisOptions } from 'ioredis';
import serverConfig from '../../config/config';
const redisConfig: RedisOptions = {
  host: serverConfig.REDIS_HOST,
  port: Number(serverConfig.REDIS_PORT),
  username: serverConfig.REDIS_USERNAME,
  password: serverConfig.REDIS_PASSWORD
};
const redisClient = new Redis(redisConfig);
export default redisClient;
