import express from 'express';
import { syscfg } from '../config';
import { isAuthenticated } from '../middlewares/authentication/isAuthenticated';

export interface Params {
  injectUserIdHeader?: boolean;
  optional?: boolean;
}

export const validatorSchema = {
  injectUserIdHeader: 'boolean',
  optional: 'boolean',
};

export async function init(params: Params) {
  const { injectUserIdHeader = true, optional = false } = params;

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
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
