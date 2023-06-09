import crypto from 'crypto';
//@ts-ignore
import isEmail from 'is-email';
import { ObjectId } from 'mongodb';
import { URL } from 'url';
import { PrismeContext } from '../../middlewares';
import { StorageDriver } from '../../storage';
import {
  AlreadyUsed,
  AuthenticationError,
  InvalidEmail,
  PrismeError,
  InvalidPassword,
  InvalidOrExpiredToken,
  NotFoundError,
  ValidateEmailError,
} from '../../types/errors';
import { comparePasswords, hashPassword } from './utils';
import { EmailTemplate, sendMail } from '../../utils/email';
import { syscfg, mails as mailConfig } from '../../config';
import { logger, Logger } from '../../logger';
import { User } from '.';

const { RESET_PASSWORD_URL, LOGIN_URL } = mailConfig;

export interface ResetPasswordRequest {
  token: string;
  expiresIn: number;
  userId: string;
}

export enum UserStatus {
  Pending = 'pending',
  Validated = 'validated',
  Deactivated = 'deactivated',
}

export const sendResetPasswordLink =
  (Users: StorageDriver<User>, ctx?: PrismeContext, logger?: Logger) =>
  async ({ email = '', language = '' }: any) => {
    const existingUsers = await Users.find({
      email: email.toLowerCase().trim(),
    });

    if (!existingUsers.length) {
      (logger || console).warn(
        `Password reset asked for a non-existent user : ${email}.`
      );
      return {};
    }

    const { firstName = '' } = existingUsers[0];

    const token = crypto.randomUUID();

    // Save the token in the user
    await Users.save({
      ...existingUsers[0],
      resetPassword: { token, expiresAt: Date.now() + 3600000 },
    });

    // Send email to the user
    const resetLink = new URL(RESET_PASSWORD_URL);
    resetLink.searchParams.append('token', token);

    try {
      await sendMail(
        EmailTemplate.ForgotPassword,
        {
          locale: language,
          name: firstName,
          resetLink: `${resetLink}`,
        },
        email
      );
    } catch (err) {
      (logger || console).warn({
        msg: 'Could not send password reset email',
        err,
      });
      return false;
    }
    return true;
  };

export const resetPassword =
  (Users: StorageDriver<User>, ctx?: PrismeContext, logger?: Logger) =>
  async ({ password, token }: any): Promise<Prismeai.User> => {
    const users = await Users.find({
      'resetPassword.token': token,
      'resetPassword.expiresAt': { $gte: Date.now() },
    });

    if (!users || !users.length) {
      throw new InvalidOrExpiredToken();
    }

    if (!syscfg.PASSWORD_VALIDATION_REGEXP.test(password)) {
      throw new InvalidPassword(
        'Invalid password : must be at least 8 characters long.'
      );
    }

    // Update the user with given password.
    const hash = await hashPassword(password);

    const savedUser = await Users.save({
      ...users[0],
      password: hash,
      resetPassword: {},
    });

    return filterUserFields(savedUser);
  };

export const sendAccountValidationLink =
  (Users: StorageDriver<User>, ctx?: PrismeContext, logger?: Logger) =>
  async ({ email = '', language = '' }: any) => {
    const existingUsers = await Users.find({
      email: email.toLowerCase().trim(),
    });

    if (!existingUsers.length) {
      (logger || console).warn(
        `Account validation link asked for a non-existent user : ${email}.`
      );
      return;
    }

    const { firstName, status } = existingUsers[0];
    if (status !== UserStatus.Pending) {
      return;
    }

    const token = crypto.randomUUID();
    await Users.save({
      ...existingUsers[0],
      validationToken: {
        token,
        expiresAt: Date.now() + 3600000,
      },
    });

    // Send email to the user
    const validateLink = new URL(LOGIN_URL);
    validateLink.searchParams.append('validationToken', token);

    await sendMail(
      EmailTemplate.ValidateAccount,
      {
        locale: language,
        name: firstName,
        validateLink: `${validateLink}`,
      },
      email
    );
    return true;
  };

export const validateAccount =
  (Users: StorageDriver<User>, ctx?: PrismeContext, logger?: Logger) =>
  async ({ token }: any): Promise<Prismeai.User> => {
    const users = await Users.find({
      'validationToken.token': token,
      'validationToken.expiresAt': { $gte: Date.now() },
      status: UserStatus.Pending,
    });

    if (!users || !users.length) {
      throw new InvalidOrExpiredToken();
    }

    const savedUser = await Users.save({
      ...users[0],
      validationToken: {},
      status: 'validated',
    });

    return filterUserFields(savedUser);
  };

export const signup = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function ({
    email,
    password,
    firstName,
    lastName,
    language,
  }: PrismeaiAPI.Signup.RequestBody): Promise<Prismeai.User> {
    email = email.toLowerCase().trim();

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
      status: UserStatus.Pending,
      language,
    };
    const savedUser = await Users.save({
      ...user,
      password: hash,
    });

    try {
      await sendAccountValidationLink(Users, ctx)({ email, language });
    } catch (err) {
      (logger || console).warn({
        msg: 'Could not send account validation email',
        err,
      });
    }

    return Promise.resolve({ ...user, id: savedUser.id! });
  };

// User getter for /me
export const get = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (id: string): Promise<Prismeai.User> {
    try {
      const user = await Users.get(id);
      return filterUserFields(user);
    } catch (err) {
      logger.warn({
        msg: `An error occured while trying to fetch user ${id}`,
        userId: id,
        err,
      });
      throw new NotFoundError('User not found', { userId: id });
    }
  };

const filterUserFields = (user: User): Prismeai.User => {
  const {
    email,
    status,
    firstName,
    lastName,
    photo,
    authData,
    language,
    mfa,
    id,
    meta,
  } = user;
  return {
    email,
    status,
    firstName,
    lastName,
    photo,
    id,
    authData,
    language,
    mfa,
    meta,
  };
};

export const updateUser = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (user: Partial<User> & { id: string }) {
    // MongoDB driver always $set & so can have partial object, but care if another driver gets in !
    await Users.save(user as User);
  };

export const login = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (email: string, password: string) {
    const users = await Users.find({ email: email.toLowerCase().trim() });
    if (!users.length) {
      throw new AuthenticationError();
    }
    if (!(await comparePasswords(password, users[0].password!))) {
      throw new AuthenticationError();
    }
    if (users[0].status && users[0].status !== UserStatus.Validated) {
      throw new ValidateEmailError();
    }
    return filterUserFields(users[0]);
  };

export const anonymousLogin = (
  Users: StorageDriver<User>,
  ctx?: PrismeContext
) =>
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
export const findContacts = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (
    { email, ids }: FindUserQuery,
    addEmail?: boolean
  ): Promise<Prismeai.Contact[]> {
    let users: User[] = [];
    if (email) {
      users = await Users.find({ email: email.toLowerCase().trim() });
    } else if (ids) {
      try {
        const mongoIds = ids.map((id) => new ObjectId(id));
        users = await Users.find({
          _id: {
            $in: mongoIds,
          },
        });
      } catch (error) {
        throw new PrismeError(`Invalid id (${ids.join(',')})`, { ids }, 400);
      }
    }
    return users.map(({ email, firstName, lastName, photo, id }) => ({
      email: addEmail ? email : undefined,
      firstName,
      lastName,
      photo,
      id,
    }));
  };
