import { storage } from '../../config';
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
} from './users';

const Users: StorageDriver = buildStorage('Users', storage.Users);

export default (ctx?: PrismeContext) => {
  return {
    signup: signup(Users, ctx),
    get: get(Users, ctx),
    login: login(Users, ctx),
    anonymousLogin: anonymousLogin(Users, ctx),
    find: find(Users, ctx),
    sendResetPasswordLink: sendResetPasswordLink(Users, ctx),
    resetPassword: resetPassword(Users, ctx),
  };
};
