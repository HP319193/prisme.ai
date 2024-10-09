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
  ForbiddenError,
  ManualValidateEmailError,
} from '../../types/errors';
import { comparePasswords, hashPassword } from './utils';
import { EmailTemplate, sendMail } from '../../utils/email';
import { extractObjectsByPath } from '../../utils/extractObjectsByPath';
import { syscfg, mails as mailConfig, authProviders } from '../../config';
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
      status:
        mailConfig.ACCOUNT_VALIDATION_METHOD !== 'auto'
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
    if (
      user.status === UserStatus.Pending &&
      mailConfig.ACCOUNT_VALIDATION_METHOD === 'email'
    ) {
      try {
        await sendAccountValidationLink(Users, ctx)({ email, language, host });
      } catch (err) {
        (logger || console).warn({
          msg: 'Could not send account validation email',
          err,
        });
      }
    }

    return Promise.resolve({
      ...user,
      id: savedUser.id!,
      validation: mailConfig.ACCOUNT_VALIDATION_METHOD,
    });
  };

// User getter for /me
export const get = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (id: string): Promise<Prismeai.User> {
    let user: User;
    try {
      user = await Users.get(id);
    } catch (err) {
      if (
        err instanceof Error &&
        (err?.message || '').includes('Argument passed in must be')
      ) {
        throw new AuthenticationError(`Invalid userId ${id}`);
      }
      logger.error({
        msg: 'Storage driver raised exception while fetching user ' + id,
        userId: id,
        err,
      });
      throw new AuthenticationError(
        'An internal error occured, please try again later or contact support.'
      );
    }
    if (!user) {
      throw new NotFoundError('User not found', { userId: id });
    }
    return filterUserFields(user);
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

export const patchUser = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (userId: string, user: Partial<User>, isSuperAdmin: boolean) {
    if (!userId) {
      throw new RequestValidationError(`Missing target userId`);
    }
    if (!isSuperAdmin && ctx?.userId !== userId) {
      throw new ForbiddenError('You can only update your own user');
    }
    const authorizedFields = new Set(
      isSuperAdmin && ctx?.userId !== userId
        ? ['firstName', 'lastName', 'meta', 'status']
        : ['firstName', 'lastName', 'meta', 'photo', 'language']
    );
    const unauthorizedField = Object.keys(user).find(
      (field) => !authorizedFields.has(field)
    );
    if (unauthorizedField) {
      throw new ForbiddenError(
        `Unauthorized update on '${unauthorizedField}' field`
      );
    }

    const existingUser = await get(Users, ctx)(userId);

    return await updateUser(
      Users,
      ctx
    )({ ...existingUser, id: userId, ...user });
  };

export const updateUser = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (user: Partial<User> & { id: string }) {
    // MongoDB driver always $set & so can have partial object, but care if another driver gets in !
    await Users.save(user as User);
    return filterUserFields(user as User);
  };

export const deleteUser = (Users: StorageDriver<User>, ctx?: PrismeContext) =>
  async function (
    id: string,
    opts?: { token?: string; isSuperAdmin?: boolean }
  ) {
    let mailTo: User | null = null;
    if (!id) {
      throw new RequestValidationError(`Missing target userId`);
    }
    if (!opts?.isSuperAdmin) {
      if (ctx?.userId !== id) {
        throw new ForbiddenError('You can delete your own user only');
      }
      const existingUser = await Users.get(id);
      if (!existingUser) {
        throw new ForbiddenError('User does not exist');
      }
      if (!existingUser.validationToken) {
        throw new ForbiddenError('Validation token not found');
      }
      const { token, expiresAt } = existingUser.validationToken as {
        token: string;
        expiresAt: string;
      };
      if (token !== opts?.token) {
        throw new ForbiddenError('Validation token invalid');
      }

      if (new Date(expiresAt) < new Date()) {
        throw new ForbiddenError('Validation token has expired');
      }
      mailTo = existingUser;
    }
    const ret = await Users.delete(id);

    if (mailTo && mailTo.email) {
      await sendMail(
        EmailTemplate.DeletedAccount,
        {
          locale: mailTo.language || 'en',
          name: mailTo.firstName,
        },
        mailTo.email
      );
    }

    return ret;
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
      if (mailConfig.ACCOUNT_VALIDATION_METHOD === 'email') {
        throw new ValidateEmailError();
      }
      if (mailConfig.ACCOUNT_VALIDATION_METHOD === 'manual') {
        throw new ManualValidateEmailError();
      }
    }
    return filterUserFields(users[0]);
  };

export const anonymousLogin = (
  Users: StorageDriver<User>,
  ctx?: PrismeContext
) =>
  async function (expiresAfter?: number) {
    let expiresAt = expiresAfter
      ? new Date(Date.now() + expiresAfter * 1000)
      : undefined;
    const user: Prismeai.User = {
      firstName:
        'anonymous-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      authData: {
        anonymous: { expiresAt },
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

    const attrMapping =
      authProviders.providers?.[provider]?.attributesMapping || {};
    // Allow hydrating some native fields based on configured mapping for auth data
    const nativeAttributes = {
      email: extractObjectsByPath(authData, attrMapping.email || 'email'),
      firstName: extractObjectsByPath(
        authData,
        attrMapping.firstName || 'firstName'
      ),
      lastName: extractObjectsByPath(
        authData,
        attrMapping.lastName || 'lastName'
      ),
    };

    if (!users.length) {
      // First time this user signs in with that authProvider
      const usersByEmail = authData.email
        ? await Users.find({
            email: authData.email,
          })
        : [];
      if (usersByEmail?.length) {
        // but another account exists with the same email, merges authData
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
          ...nativeAttributes,
          authData: {
            [provider]: authData,
          },
          status: UserStatus.Validated,
          language: authData.language || 'fr',
        });
        newAccount = true;
      }
    } else {
      // Keep native attributes in sync on each sign in
      const nativeFieldUpdates = Object.entries(nativeAttributes).reduce(
        (fieldUpdates, [k, v]) =>
          v && v !== (user as any)[k as any]
            ? {
                ...fieldUpdates,
                [k]: v,
              }
            : fieldUpdates,
        {}
      );

      const id = user.id;
      user = await Users.save({
        ...user,
        ...nativeFieldUpdates,
        authData: {
          ...user.authData,
          [provider]: authData,
        },
      });
      user.id = id;
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

    let page = 0;
    let limit = 1;
    let resultSize = 1;

    // Both super admin & normal users can match by exact id
    if (ids) {
      try {
        mongoQuery['_id'] = {
          $in: ids.map((id) => new ObjectId(id)),
        };
        limit = ids.length;
      } catch {
        throw new PrismeError(`Invalid id (${ids.join(',')})`, { ids }, 400);
      }
    }

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

      if (authProvider === 'prismeai') {
        mongoQuery['password'] = { $exists: true };
      } else if (authProvider) {
        mongoQuery['authData.' + authProvider] = { $exists: true };
      }

      limit = opts?.limit || 50;
      page = opts?.page || 0;
    } else {
      // Normal user filters
      if (email) {
        mongoQuery.email = email.toLowerCase().trim();
        limit = 1;
      }
      if (!Object.keys(mongoQuery).length) {
        throw new RequestValidationError(
          'Either ids or email body field must be provided.'
        );
      }

      page = 0;
    }

    [users, resultSize] = await Promise.all([
      Users.find(mongoQuery, { page, limit }),
      limit > 1 ? Users.count(mongoQuery) : Promise.resolve(1),
    ]);
    return {
      size: resultSize,
      contacts: users.map(
        ({
          email,
          firstName,
          lastName,
          language,
          photo,
          id,
          status,
          meta,
        }) => ({
          id,
          email: isSuperAdmin ? email : undefined,
          firstName,
          lastName,
          language: isSuperAdmin ? language : undefined,
          status: isSuperAdmin ? status : undefined,
          photo,
          meta: isSuperAdmin ? meta : undefined,
        })
      ),
    };
  };

export const sendAccountDeleteValidationLink =
  (Users: StorageDriver<User>, ctx?: PrismeContext, logger?: Logger) =>
  async (id: string, host: string) => {
    const user = await get(Users, ctx)(id);
    if (!user || !user.email) {
      (logger || console).warn(
        `Delete account validation link asked for a non-existent user : ${id}.`
      );
      return;
    }

    const token = crypto.randomUUID();
    await Users.save({
      ...user,
      validationToken: {
        token,
        expiresAt: Date.now() + 3600000,
      },
    });

    const validateLink = new URL(`/account/delete`, host);
    validateLink.searchParams.append('validationToken', token);

    await sendMail(
      EmailTemplate.ValidateDeleteAccount,
      {
        locale: user.language || 'en',
        name: user.firstName,
        validateLink: `${validateLink}`,
      },
      user.email
    );
    return true;
  };
