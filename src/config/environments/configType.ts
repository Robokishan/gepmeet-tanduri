interface configType {
  PORT: string | number;
  ACCESS_TOKEN_SECRET:
    | string
    | Buffer
    | { key: string | Buffer; passphrase: string };
  REFRESH_TOKEN_SECRET:
    | string
    | Buffer
    | { key: string | Buffer; passphrase: string };
  ACCESS_TOKEN_EXPIRATION: number;
  REFRESH_TOKEN_EXPIRATION: number;
  SALT_ROUNDS: number;
  RABITMQ_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME?: string;
  REDIS_PASSWORD?: string;
}

export default configType;
