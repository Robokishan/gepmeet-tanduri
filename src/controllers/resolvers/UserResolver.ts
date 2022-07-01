import jwt from 'jsonwebtoken';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql';
import { LoginInput, RegistrationInput, User } from '../../entities/User';
import { Context } from '../../types/Context';
import { validateRefreshToken } from '../../utils/AuthCheker';
import { CookieKeys, __prod__ } from '../../utils/constant';
import {
  createAccessToken,
  createRefreshToken,
  generatePassword,
  verifyPassword
} from '../../utils/PasswordManager';

@ObjectType()
class Token {
  @Field()
  access_token: string;

  @Field()
  expires_in: string;

  @Field()
  refreshToken: string;

  @Field()
  rexpires_in: string;
}

@ObjectType()
class UserAuth {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  token: Token;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserAuth, { nullable: true })
  user?: UserAuth;
}

@ObjectType()
class RegistrationUser {
  @Field()
  name?: string;

  @Field()
  email?: string;
}

@ObjectType()
class RegistrationResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => RegistrationUser, { nullable: true })
  user?: RegistrationUser;
}

@Resolver()
export class UserResolver {
  // NOTE: FOR TESTING PURPOSE ONLY
  @Authorized()
  @Query(() => [User])
  async user(@Ctx() { em }: Context) {
    return em.find(User, {});
  }

  @Authorized()
  @Query(() => User)
  async me(@Ctx() { em, req }: Context) {
    return em.findOne(User, { id: req.userId });
  }

  // TODO: FOR TESTING PURPOSE ONLY
  @Authorized()
  @Mutation(() => Boolean)
  async deleteUser(
    @Arg('id', () => String) id: string,
    @Ctx() { em }: Context
  ) {
    const user = await em.getRepository(User).findOneOrFail({ id });
    await em.getRepository(User).removeAndFlush(user);
    return true;
  }

  @Mutation(() => RegistrationResponse)
  async registration(
    @Arg('options') options: RegistrationInput,
    @Ctx() { em }: Context
  ) {
    const user = new User();
    user.name = options.name;
    user.email = options.email;
    user.details = options.details;
    user.username = options.username;
    user.verified = 'unverified';

    try {
      const hashedPassword = generatePassword(options.password);
      user.password = hashedPassword;
      const userReposistory = em.getRepository(User);
      await userReposistory.persist(user).flush();

      return {
        user: {
          name: options.name,
          email: options.email
        }
      };
    } catch (error) {
      return {
        errors: [
          {
            field: 'email',
            message: 'Somthing went wrong'
          }
        ]
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { em, res }: Context
  ) {
    const userReposistory = em.getRepository(User);
    const user = await userReposistory.findOne({ email: options.email });
    try {
      if (!user) {
        return {
          errors: [
            {
              field: 'email',
              message: 'Somthing went wrong'
            }
          ]
        };
      }
      const { isValid } = await verifyPassword(options.password, user);
      if (isValid != true || user == null) {
        return {
          errors: [
            {
              field: 'email',
              message: 'Somthing went wrong'
            }
          ]
        };
      } else {
        const { token: accesstoken } = createAccessToken(user);
        const { token: refreshToken, expire } = createRefreshToken(user);

        // NOTE: Make sure cookie params are properly set so that it can work with studio.apollographql.com
        res.cookie(CookieKeys.REFRESH_TOKEN, refreshToken, {
          secure: true,
          httpOnly: true,
          maxAge: expire * 1000,
          sameSite: 'none'
        });

        return {
          user: {
            name: user?.name,
            email: user?.email,
            id: user?.id,
            token: {
              access_token: accesstoken,
              expires_in: (jwt.decode(accesstoken) as any).exp,
              refreshToken,
              rexpires_in: (jwt.decode(refreshToken) as any).exp
            }
          }
        };
      }
    } catch (error) {
      return {
        errors: [
          {
            field: 'email',
            message: (error as Error).message
          }
        ]
      };
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: Context) {
    res.clearCookie(CookieKeys.REFRESH_TOKEN);
    return true;
  }

  @Mutation(() => UserResponse)
  async refresh(@Ctx() { req, em, res }: Context) {
    const token = req.cookies[CookieKeys.REFRESH_TOKEN];
    if (token) {
      const { decoded, isValidToken } = validateRefreshToken(token);
      if (isValidToken) {
        const { userId: id } = decoded;
        const user = await em.getRepository(User).findOneOrFail({ id });
        const { token: accesstoken } = createAccessToken(user);
        const { token: refreshToken, expire } = createRefreshToken(user);

        // NOTE: Make sure cookie params are properly set so that it can work with studio.apollographql.com
        res.cookie(CookieKeys.REFRESH_TOKEN, refreshToken, {
          secure: true,
          httpOnly: true,
          maxAge: expire * 1000,
          sameSite: 'none'
        });

        return {
          user: {
            name: user?.name,
            email: user?.email,
            id: user?.id,
            token: {
              access_token: accesstoken,
              expires_in: (jwt.decode(accesstoken) as any).exp,
              refreshToken,
              rexpires_in: (jwt.decode(refreshToken) as any).exp
            }
          }
        };
      }
    } else {
      res.statusCode = 401;
      return {
        errors: [
          {
            field: 'not found',
            message: 'Somthing went wrong'
          }
        ]
      };
    }
  }
}
