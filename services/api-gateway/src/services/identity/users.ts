import { PrismeContext } from "../../middlewares";
import { StorageDriver } from "../../storage";
import {
  AlreadyUsed,
  AuthenticationError,
  InvalidEmail,
} from "../../types/errors";
import { comparePasswords, hashPassword } from "./utils";
import isEmail from "is-email";

export const signup = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function ({
    email,
    password,
    firstName,
    lastName,
  }: PrismeaiAPI.Signup.RequestBody) {
    const existingUsers = await Users.find({ email });
    if (existingUsers.length) {
      throw new AlreadyUsed("email");
    }

    if (!isEmail(email)) {
      throw new InvalidEmail();
    }

    const hash = await hashPassword(password);
    const user: Prismeai.User = {
      email,
      firstName,
      lastName,
    };
    const savedUser = await Users.save({ ...user, password: hash });
    return Promise.resolve(savedUser);
  };

export const get = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function (id: string) {
    return await Users.get(id);
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
    return users[0];
  };

export const anonymousLogin = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function () {
    const user: Prismeai.User = {
      firstName:
        "anonymous-" + Date.now() + "-" + Math.round(Math.random() * 1000),
      authData: {
        anonymous: {},
      },
    };
    return await Users.save(user);
  };
