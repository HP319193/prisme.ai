import { storage } from '../../config';
import { Logger } from '../../logger';
import { PrismeContext } from '../../middlewares';
import { buildStorage, StorageDriver } from '../../storage';
import {
  anonymousLogin,
  find,
  get,
  login,
  signup,
  sendResetPasswordLink,
  resetPassword,
  validateAccount,
  sendAccountValidationLink,
} from './users';

const Users: StorageDriver = buildStorage('Users', storage.Users);

export default (ctx?: PrismeContext, logger?: Logger) => {
  return {
    signup: signup(Users, ctx),
    get: get(Users, ctx),
    login: login(Users, ctx),
    anonymousLogin: anonymousLogin(Users, ctx),
    find: find(Users, ctx),
    sendResetPasswordLink: sendResetPasswordLink(Users, ctx, logger),
    resetPassword: resetPassword(Users, ctx, logger),
    validateAccount: validateAccount(Users, ctx, logger),
    sendAccountValidationLink: sendAccountValidationLink(Users, ctx, logger),
  };
};
