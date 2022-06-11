interface configType {
  PORT: string | number;
  SECRET: string | Buffer | { key: string | Buffer; passphrase: string };
  JWT_EXPIRATION: number;
  SALT_ROUNDS: number;
  RABITMQ_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME?: string;
  REDIS_PASSWORD?: string;
}

export default configType;
