import configType from './configType';

const config: configType = {
  PORT: process.env.PORT || 5050,
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_DEV_SECRET',
  ACCESS_TOKEN_EXPIRATION: Number(process.env.ACCESS_TOKEN_EXPIRATION) || 86400,
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_DEV_SECRET',
  REFRESH_TOKEN_EXPIRATION:
    Number(process.env.REFRESH_TOKEN_EXPIRATION) || 86400 * 2,
  SALT_ROUNDS: 10,
  RABITMQ_URL: process.env.RABITMQ_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6079,
  REDIS_USERNAME: process.env.REDIS_USERNAME || undefined,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined
};

export default config;
