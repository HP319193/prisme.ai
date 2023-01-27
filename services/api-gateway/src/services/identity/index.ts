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
import {
  createAccessToken,
  listAccessTokens,
  deleteAccessToken,
  validateAccessToken,
} from './accessTokens';
import { OTPKey, User, AccessToken } from './types';
import { buildCache } from '../../cache';
export * from './types';

const cache = buildCache(storage.Sessions);

const Users = buildStorage<User>('Users', storage.Users);
const OTPKeys = buildStorage<OTPKey>('OTPKeys', storage.Users);
const AccessTokens = buildStorage<AccessToken>('AccessTokens', {
  ...storage.Users,
  cache: {
    key: 'token',
    driver: cache,
  },
});

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

    createAccessToken: createAccessToken(AccessTokens),
    listAccessTokens: listAccessTokens(AccessTokens),
    deleteAccessToken: deleteAccessToken(AccessTokens),
    validateAccessToken: validateAccessToken(AccessTokens),
  };
};
