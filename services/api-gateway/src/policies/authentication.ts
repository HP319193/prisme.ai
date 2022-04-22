import express from 'express';
import { syscfg } from '../config';
import { isAuthenticated } from '../middlewares/authentication/isAuthenticated';

export interface Params {
  injectUserIdHeader?: boolean;
  optional?: boolean;
  allowApiKeyOnly?: boolean;
}

export const validatorSchema = {
  injectUserIdHeader: 'boolean',
  optional: 'boolean',
  allowApiKeyOnly: 'boolean',
};

export async function init(params: Params) {
  let {
    injectUserIdHeader = true,
    optional = false,
    allowApiKeyOnly = false,
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
    return isAuthenticated(
      req,
      res,
      (user) => {
        if (user && injectUserIdHeader) {
          req.headers[syscfg.USER_ID_HEADER] = req.user?.id;
        }
        next();
      },
      optional
    );
  };
}
