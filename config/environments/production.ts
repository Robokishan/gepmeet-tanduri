import configType from './configType';
const config: configType = {
  PORT: process.env.PORT || 80,
  SECRET: process.env.JWT_SECRET || 'DEV_SECRET',
  JWT_EXPIRATION: Number(process.env.JWT_EXPIRATION) || 86400,
  SALT_ROUNDS: 10,
  RABITMQ_URL: process.env.RABITMQ_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6079,
  REDIS_USERNAME: process.env.REDIS_USERNAME || undefined,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined
};

export default config;
