import { PrismeContext } from "../../middlewares";
import { StorageDriver } from "../../storage";
import { AlreadyUsed, AuthenticationError } from "../../types/errors";
import { comparePasswords, hashPassword } from "./utils";

export const signup = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function (req: PrismeaiAPI.Signup.RequestBody) {
    const existingUsers = await Users.find({ email: req.username });
    if (existingUsers.length) {
      throw new AlreadyUsed("email");
    }

    const password = await hashPassword(req.password);
    const user: Prismeai.User = {
      email: req.username,
      firstName: req.firstName,
      lastName: req.lastName,
    };
    const savedUser = await Users.save({ ...user, password });
    return Promise.resolve(savedUser);
  };

export const get = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function (id: string) {
    return await Users.get(id);
  };

export const login = (Users: StorageDriver, ctx?: PrismeContext) =>
  async function (username: string, password: string) {
    const users = await Users.find({ email: username });
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
