import { storage } from '../../config';
import { Logger } from '../../logger';
import { PrismeContext } from '../../middlewares';
import { buildStorage } from '../../storage';
import {
  anonymousLogin,
  findContacts,
  get,
  login,
  updateUser,
  signup,
  sendResetPasswordLink,
  resetPassword,
  validateAccount,
  sendAccountValidationLink,
} from './users';
import { setupUserMFA, validateMFA } from './mfa';
import { OTPKey, User } from './types';
export * from './types';

const Users = buildStorage<User>('Users', storage.Users);
const OTPKeys = buildStorage<OTPKey>('OTPKeys', storage.Users);

export default (ctx?: PrismeContext, logger?: Logger) => {
  return {
    signup: signup(Users, ctx),
    get: get(Users, ctx),
    updateUser: updateUser(Users, ctx),
    login: login(Users, ctx),
    anonymousLogin: anonymousLogin(Users, ctx),
    findContacts: findContacts(Users, ctx),
    sendResetPasswordLink: sendResetPasswordLink(Users, ctx, logger),
    resetPassword: resetPassword(Users, ctx, logger),
    validateAccount: validateAccount(Users, ctx, logger),
    sendAccountValidationLink: sendAccountValidationLink(Users, ctx, logger),
    setupUserMFA: setupUserMFA(OTPKeys, ctx, logger),
    validateMFA: validateMFA(OTPKeys),
  };
};
