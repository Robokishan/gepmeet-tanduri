import { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/config';

interface Verified {
  isValid: boolean;
  id: string;
  email: string;
}

function verifyPassword(password: string, user: any): Promise<Verified> {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, user.password, function (err: any, result: any) {
      if (err) {
        reject(err);
      } else {
        resolve({ isValid: result, id: user.id, email: user.email });
      }
    });
  });
}

function generatePassword(password: string) {
  return bcrypt.hashSync(password, config.SALT_ROUNDS);
}

interface TokenResponse {
  token: string;
  expire: number;
}
const createAccessToken = (user: any): TokenResponse => {
  return {
    token: sign(
      {
        userId: user.id,
        email: user.email,
        user_name: user.user_name,
        type: user.type
      },
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: config.ACCESS_TOKEN_EXPIRATION
      }
    ),
    expire: config.ACCESS_TOKEN_EXPIRATION
  };
};

const createRefreshToken = (user: any): TokenResponse => {
  return {
    token: sign(
      {
        userId: user.id
      },
      config.REFRESH_TOKEN_SECRET,
      {
        expiresIn: config.REFRESH_TOKEN_EXPIRATION
      }
    ),
    expire: config.REFRESH_TOKEN_EXPIRATION
  };
};

export {
  verifyPassword,
  generatePassword,
  createAccessToken,
  createRefreshToken
};
