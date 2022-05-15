import express from 'express';
import cookieParser from 'cookie-parser';
import Logger from '../utils/logger';

const logger = new Logger();

export default function () {
  const app = express();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true
    })
  );
  app.use(cookieParser());
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  return app;
}
