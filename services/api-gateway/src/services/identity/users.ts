import crypto from 'crypto';
//@ts-ignore
import isEmail from 'is-email';
import { ObjectId } from 'mongodb';
import { URL } from 'url';
import { PrismeContext } from '../../middlewares';
import { FindOpts, StorageDriver } from '../../storage';
import {
  AlreadyUsed,
  AuthenticationError,
  InvalidEmail,
  PrismeError,
  InvalidPassword,
  InvalidOrExpiredToken,
  NotFoundError,
  ValidateEmailError,
  RequestValidationError,
} from '../../types/errors';
import { comparePasswords, hashPassword } from './utils';
import { EmailTemplate, sendMail } from '../../utils/email';
import { syscfg, mails as mailConfig } from '../../config';
import { logger, Logger } from '../../logger';
import { AuthProviders, User } from '.';

const { RESET_PASSWORD_URL, CONSOLE_URL } = mailConfig;

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
  async ({ email = '', language = '', host = CONSOLE_URL }: any) => {
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
    const validateLink = new URL('/signin', host);
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
  async function (
    {
      email,
      password,
      firstName,
      lastName,
      language,
    }: PrismeaiAPI.Signup.RequestBody,
    host?: string
  ): Promise<Prismeai.User> {
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
      status: mailConfig.EMAIL_VALIDATION_ENABLED
        ? UserStatus.Pending
        : UserStatus.Validated,
      language,
      authData: {
        prismeai: { email },
      },
    };
    const savedUser = await Users.save({
      ...user,
      password: hash,
    });

    if (user.status === UserStatus.Pending) {
      try {
        await sendAccountValidationLink(Users, ctx)({ email, language, host });
      } catch (err) {
        (logger || console).warn({
          msg: 'Could not send account validation email',
          err,
        });
      }
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
  let {
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
    password,
  } = user;
  if (!authData) {
    authData = email
      ? {
          prismeai: { id, email },
        }
      : {
          anonymous: { id },
        };
  } else if (authData.prismeai || (!authData.prismeai && password)) {
    authData.prismeai = {
      ...authData.prismeai,
      id,
      email: authData.prismeai?.email || email,
    };
  }
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
    const users = (
      await Users.find({ email: email.toLowerCase().trim() })
    ).filter((cur) => cur.password); // External providers don't have passwords
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

export const externalLoginOrSignup = (
  Users: StorageDriver<User>,
  ctx?: PrismeContext
) =>
  async function (provider: AuthProviders, authData: Prismeai.AuthData) {
    if (!authData.id) {
      throw new AuthenticationError('Missing user id from external provider');
    }
    // First find any user matching this same external id
    const users = await Users.find({
      [`authData.${provider}.id`]: authData.id,
    });
    let user: Prismeai.User = users[0];
    let newAccount = false;

    if (!users.length) {
      // is there another account matching the same email ?
      const usersByEmail = authData.email
        ? await Users.find({
            email: authData.email,
          })
        : [];
      // Another account exists with the same email, merges authData
      if (usersByEmail?.length) {
        user = await Users.save({
          ...usersByEmail[0],
          authData: {
            ...usersByEmail[0].authData,
            [provider]: authData,
          },
          status:
            usersByEmail[0].status === UserStatus.Pending
              ? UserStatus.Validated
              : usersByEmail[0].status, // We do not force to Validated as an user could haven been Deactivated
        });
        user.id = usersByEmail[0].id;
      } else {
        // Sign up
        user = await Users.save({
          firstName: authData.firstName || 'Guest',
          lastName: authData.lastName,
          email: authData.email,
          authData: {
            [provider]: authData,
          },
          status: UserStatus.Validated,
          language: 'fr',
        });
        newAccount = true;
      }
    }

    // Keep emails in sync
    if (user.email && authData.email && user.email !== authData.email) {
      user = await Users.save({
        ...user,
        email: authData.email,
        authData: {
          ...user.authData,
          [provider]: authData,
        },
      });
    }

    if (user.status && user.status !== UserStatus.Validated) {
      throw new ValidateEmailError();
    }
    return { ...filterUserFields(user), newAccount };
  };

function escapeRegex(str: string) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
export const findContacts = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (
    {
      email,
      ids,
      firstName,
      lastName,
      authProvider,
      status,
    }: PrismeaiAPI.FindContacts.RequestBody,
    opts: FindOpts,
    isSuperAdmin?: boolean
  ): Promise<PrismeaiAPI.FindContacts.Responses.$200> {
    let users: User[] = [];
    const mongoQuery: any = {};

    // Both super admin & normal users can match by exact id
    if (ids) {
      try {
        mongoQuery['_id'] = {
          $in: ids.map((id) => new ObjectId(id)),
        };
      } catch {
        throw new PrismeError(`Invalid id (${ids.join(',')})`, { ids }, 400);
      }
    }

    let page = 0;
    let limit = 1;
    let resultSize = 1;

    // Super admin only filters
    if (isSuperAdmin) {
      if (email) {
        mongoQuery.email = {
          $regex: escapeRegex(email.toLowerCase().trim()),
          $options: 'i',
        };
      }
      if (firstName) {
        mongoQuery.firstName = {
          $regex: escapeRegex(firstName.toLowerCase().trim()),
          $options: 'i',
        };
      }
      if (lastName) {
        mongoQuery.lastName = {
          $regex: escapeRegex(lastName.toLowerCase().trim()),
          $options: 'i',
        };
      }

      if (status) {
        mongoQuery.status = status;
      }

      authProvider = authProvider || 'prismeai';
      if (authProvider === 'prismeai') {
        mongoQuery['password'] = { $exists: true };
      } else {
        mongoQuery['authData.' + authProvider] = { $exists: true };
      }

      limit = opts?.limit || 50;
      page = opts?.page || 0;
    } else {
      // Normal user filters
      if (email) {
        mongoQuery.email = email.toLowerCase().trim();
      }
      if (!Object.keys(mongoQuery).length) {
        throw new RequestValidationError(
          'Either ids or email body field must be provided.'
        );
      }

      limit = 1;
      page = 0;
    }

    [users, resultSize] = await Promise.all([
      Users.find(mongoQuery, { page, limit }),
      limit > 1 ? Users.count(mongoQuery) : Promise.resolve(1),
    ]);
    return {
      size: resultSize,
      contacts: users.map(
        ({ email, firstName, lastName, photo, id, status }) => ({
          id,
          email: isSuperAdmin ? email : undefined,
          firstName,
          lastName,
          status: isSuperAdmin ? status : undefined,
          photo,
        })
      ),
    };
  };
