import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { MongoEntityManager } from '@mikro-orm/mongodb/MongoEntityManager';
import { Request, Response } from 'express';

interface CustomRequestType extends Request {
  userId?: string;
}

export interface Context {
  em: MongoEntityManager<MongoDriver> &
    EntityManager<IDatabaseDriver<Connection>>;
  req: CustomRequestType;
  res: Response;
}
