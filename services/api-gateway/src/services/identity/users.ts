import { PrismeContext } from '../../middlewares';
import { StorageDriver } from '../../storage';
import {
  AlreadyUsed,
  AuthenticationError,
  InvalidEmail,
  PrismeError,
  InvalidPassword,
} from '../../types/errors';
import { comparePasswords, hashPassword } from './utils';
import isEmail from 'is-email';
import { ObjectId } from 'mongodb';
import { syscfg } from '../../config';

export const signup = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function ({
    email,
    password,
    firstName,
    lastName,
  }: PrismeaiAPI.Signup.RequestBody) {
    const existingUsers = await Users.find({ email });
    if (existingUsers.length) {
      throw new AlreadyUsed('email');
    }

    if (!isEmail(email)) {
      throw new InvalidEmail();
    }

    if (!syscfg.PASSWORD_VALIDATION_REGEXP.test(password)) {
      throw new InvalidPassword(
        'Invalid password : must be at least 8 characters long.'
      );
    }

    const hash = await hashPassword(password);
    const user: Prismeai.User = {
      email,
      firstName,
      lastName,
    };
    const savedUser = await Users.save({ ...user, password: hash });
    delete savedUser.password;
    return Promise.resolve(savedUser);
  };

export const get = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function (id: string) {
    const user = await Users.get(id);
    delete user.password;
    return user;
  };

export const login = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function (email: string, password: string) {
    const users = await Users.find({ email });
    if (!users.length) {
      throw new AuthenticationError();
    }
    if (!(await comparePasswords(password, users[0].password))) {
      throw new AuthenticationError();
    }
    delete users[0].password;
    return users[0];
  };

export const anonymousLogin = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function () {
    const user: Prismeai.User = {
      firstName:
        'anonymous-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      authData: {
        anonymous: {},
      },
    };
    return await Users.save(user);
  };

export interface FindUserQuery {
  email?: string;
  ids?: string[];
}
export const find = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function ({ email, ids }: FindUserQuery) {
    if (email) {
      return await Users.find({ email });
    }
    if (ids) {
      try {
        const mongoIds = ids.map((id) => new ObjectId(id));
        const users = await Users.find({
          _id: {
            $in: mongoIds,
          },
        });
        return users.map(({ password, ...user }) => user);
      } catch (error) {
        throw new PrismeError(`Invalid id (${ids.join(',')})`, { ids }, 400);
      }
    }
    return [];
  };
