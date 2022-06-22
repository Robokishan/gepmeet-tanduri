import { AuthChecker } from 'type-graphql';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import Logger from './logger';

const log = new Logger();

interface TokenValidityResponse {
  isValidToken: boolean;
  decoded: any;
}

export const validateToken = (token: string): TokenValidityResponse => {
  let isValidToken = false;
  let decoded = null;
  try {
    decoded = jwt.verify(token, config.SECRET) as any;
    //   no need it is just to check if user has changed password nor not
    //   const user = await Users.findOne({ id: decoded.userId });
    //   req.userId = decoded.userId;

    isValidToken = true;
  } catch (Err) {
    log.error('Err', Err);
    isValidToken = false;
  }
  return { isValidToken, decoded };
};

export const customAuthChecker: AuthChecker = async (
  { root, args, context, info },
  roles
) => {
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  const { req } = context as any;
  //get the token from authorization : Bearer <token>
  const token = req.headers?.authorization;
  log.info('token', token);

  let isValidToken = false;
  if (token) {
    const { isValidToken: _isValid, decoded } = validateToken(token);
    isValidToken = _isValid;
    (context as any).req = {
      ...req,
      userId: decoded.userId,
      owner: decoded
    };
  }

  if (!token || !isValidToken) throw new Error('Authorization error');
  return !!token;
};
