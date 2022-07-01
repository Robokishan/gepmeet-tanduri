declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: number;
    MONGODB_URL: string;
    RABITMQ_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
  }
}
