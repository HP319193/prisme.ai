import crypto from 'crypto';
import { AccessToken } from '.';
import { StorageDriver } from '../../storage';
import {
  AuthenticationError,
  NotFoundError,
  RequestValidationError,
} from '../../types/errors';

export const createAccessToken =
  (AccessTokens: StorageDriver<AccessToken>) =>
  async (
    user: Prismeai.User,
    data: PrismeaiAPI.CreateAccessToken.RequestBody
  ): Promise<PrismeaiAPI.CreateAccessToken.Responses.$200> => {
    if (!data.expiresAt || !data.name) {
      throw new RequestValidationError('Missing expiresAt or name');
    }
    const expiresAt = new Date(data.expiresAt);
    if (isNaN(expiresAt as any as number) || expiresAt.getTime() < Date.now()) {
      throw new RequestValidationError(
        'Invalid expiresAt : must be a valid ISO8601 string after current date'
      );
    }

    const accessToken: AccessToken = {
      ...data,
      userId: user.id,
      token: 'at:' + crypto.randomUUID(),
    };
    await AccessTokens.save(accessToken);
    return accessToken;
  };

export const listAccessTokens =
  (AccessTokens: StorageDriver<AccessToken>) =>
  async (
    user: Prismeai.User
  ): Promise<PrismeaiAPI.ListAccessTokens.Responses.$200> => {
    return await AccessTokens.find({ userId: user.id });
  };

export const deleteAccessToken =
  (AccessTokens: StorageDriver<AccessToken>) =>
  async (
    user: Prismeai.User,
    token: string
  ): Promise<PrismeaiAPI.CreateAccessToken.Responses.$200> => {
    const accessToken = (
      await AccessTokens.find({ userId: user.id, token })
    )[0];
    if (!accessToken) {
      throw new NotFoundError('Access token not found');
    }
    await AccessTokens.delete(accessToken.id!);
    return accessToken;
  };

export const validateAccessToken =
  (AccessTokens: StorageDriver<AccessToken>) =>
  async (token: string): Promise<Express.CustomSessionFields> => {
    const accessToken = (await AccessTokens.find({ token }))[0];
    // TODO cache
    if (!accessToken) {
      throw new AuthenticationError('Invalid access token');
    }

    if (new Date(accessToken.expiresAt).getTime() < Date.now()) {
      throw new AuthenticationError('Expired access token');
    }
    return {
      passport: {
        user: accessToken.userId as string,
      },
      prismeaiSessionId: `at:${accessToken.id}`,
      mfaValidated: true,
    };
  };
