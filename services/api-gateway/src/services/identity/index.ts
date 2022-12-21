import { storage } from '../../config';
import { Logger } from '../../logger';
import { PrismeContext } from '../../middlewares';
import { buildStorage, StorageDriver } from '../../storage';
import {
  anonymousLogin,
  findContacts,
  get,
  login,
  signup,
  sendResetPasswordLink,
  resetPassword,
  validateAccount,
  sendAccountValidationLink,
} from './users';

export interface User extends Prismeai.User {
  resetPassword?:
    | {
        token: string;
        expiresAt: number;
      }
    | {};
  password?: string;
  validationToken?:
    | {
        token: string;
        expiresAt: number;
      }
    | {};
}

export interface OTPKey {
  method: Prismeai.SupportedMFA;
  key: string;
  userId: string;
  period: number;
}

const Users = buildStorage<User>('Users', storage.Users);
const OTPKeys = buildStorage<OTPKey>('OTPKeys', storage.Users);

export default (ctx?: PrismeContext, logger?: Logger) => {
  return {
    signup: signup(Users, ctx),
    get: get(Users, ctx),
    login: login(Users, ctx),
    anonymousLogin: anonymousLogin(Users, ctx),
    findContacts: findContacts(Users, ctx),
    sendResetPasswordLink: sendResetPasswordLink(Users, ctx, logger),
    resetPassword: resetPassword(Users, ctx, logger),
    validateAccount: validateAccount(Users, ctx, logger),
    sendAccountValidationLink: sendAccountValidationLink(Users, ctx, logger),
  };
};
