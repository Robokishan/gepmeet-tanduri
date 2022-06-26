// Construct a schema, using GraphQL schema language

import {
  Connection,
  EntityManager,
  IDatabaseDriver,
  MikroORM
} from '@mikro-orm/core';
import { MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import { Conversation } from '../../entities/Conversation';
import { Permission } from '../../entities/Permission';
import { User } from '../../entities/User';
import { __prod__ } from '../../utils/constant';
import Logger from '../../utils/logger';

// make sure to provide the MongoDriver type hint
const log = new Logger();
let orm: MikroORM<MongoDriver>;
let em: MongoEntityManager<MongoDriver> &
  EntityManager<IDatabaseDriver<Connection>>;
const initOrm = async () => {
  try {
    log.info('MongoURL => ', process.env.MONGODB_URL);
    orm = await MikroORM.init<MongoDriver>({
      entities: [Conversation, User, Permission],
      dbName: 'tanduri',
      clientUrl: process.env.MONGODB_URL,
      type: 'mongo',
      debug: !__prod__,
      allowGlobalContext: true,
      implicitTransactions: true, // defaults to false
      ensureIndexes: true // defaults to false,
    });
  } catch (error) {
    log.error(error);
    process.exit(1);
  }

  await orm.getSchemaGenerator().createSchema();
  em = orm.em;
};

export { initOrm, em };
