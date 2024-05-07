import express from 'express';
import { syscfg } from '../config';
import { AuthenticationError } from '../types/errors';
import { enforceMFA as mfaMiddleware } from '../middlewares/authentication/isAuthenticated';

export interface Params {
  injectUserIdHeader?: boolean;
  optional?: boolean;
  allowApiKeyOnly?: boolean;
  enforceMFA?: boolean;
}

export const validatorSchema = {
  injectUserIdHeader: 'boolean',
  optional: 'boolean',
  allowApiKeyOnly: 'boolean',
  enforceMFA: 'boolean',
};

export async function init(params: Params) {
  let {
    injectUserIdHeader = true,
    optional = false,
    allowApiKeyOnly = false,
    enforceMFA = true,
  } = params;

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!req.user && allowApiKeyOnly && req.headers[syscfg.API_KEY_HEADER]) {
      optional = true;
      // TODO should check api key validity
    }
    if (req.user && injectUserIdHeader) {
      req.headers[syscfg.USER_ID_HEADER] = req.user?.id;
    }
    if (!req.user && !optional) {
      throw new AuthenticationError(req.authError || 'Unauthenticated');
    }
    if (enforceMFA && !optional) {
      return mfaMiddleware(req, res, next);
    }
    next();
  };
}
