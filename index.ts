process.env.NODE_ENV = process.env.NODE_ENV || 'development';
import 'dotenv/config';
// const deps
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground
} from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import colors from 'colors';
import cors, { CorsOptions } from 'cors';
import httpServer from 'http';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

// local deps
import { startRabbit } from './client/rabbitmq';
import config from './config/config';
import express from './config/express';
import { ConversationResolver } from './controllers/resolvers/ConversationResolver';
import { UserResolver } from './controllers/resolvers/UserResolver';
import { Conversation } from './entities/Conversation';
import { Permission } from './entities/Permission';
import { User } from './entities/User';
import { TanduriSocket } from './modules/liveDhokla';
import { Context } from './types/Context';
import { customAuthChecker } from './utils/AuthCheker';
import { __prod__ } from './utils/constant';
import Logger from './utils/logger';

async function main() {
  // Create server
  const log = new Logger();
  const app = express();

  const originList = ['http://localhost:3000'];

  if (process.env.NODE_ENV == 'development')
    originList.push('https://studio.apollographql.com');

  // start rabbitmq connection
  await startRabbit();

  // Construct a schema, using GraphQL schema language
  // make sure to provide the MongoDriver type hint
  let orm: MikroORM<MongoDriver>;
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

  const schema = await buildSchema({
    resolvers: [ConversationResolver, UserResolver], // add this,
    authChecker: customAuthChecker,
    authMode: 'null'
  });
  const server = new ApolloServer({
    schema,
    plugins: [
      __prod__
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground()
    ],
    context: ({ req, res }) => {
      const ctx: Context = {
        em: orm.em,
        req,
        res
      };
      return ctx;
    }
  });

  // enable cors
  const corsOptions: CorsOptions = {
    origin: originList,
    credentials: true // <-- REQUIRED backend setting
  };
  // app.set("trust proxy", process.env.NODE_ENV !== "production");
  app.use(cors(corsOptions));
  await server.start();
  server.applyMiddleware({
    app,
    cors: false
  });

  // Start listening

  const httpserver = httpServer.createServer(app);

  TanduriSocket(httpserver, { cors: corsOptions });
  httpserver.listen(config.PORT, function () {
    log.info(
      colors.green(
        '🚀  Listening with ' +
          process.env.NODE_ENV +
          ' config on port ' +
          config.PORT
      )
    );
  });
}
main();
