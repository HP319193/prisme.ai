import express from 'express';
import { syscfg } from '../config';
import { isAuthenticated } from '../middlewares/authentication/isAuthenticated';

export interface Params {
  injectUserIdHeader?: boolean;
}

export const validatorSchema = {
  injectUserIdHeader: 'boolean',
};

export async function init(params: Params) {
  const { injectUserIdHeader = true } = params;

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    return isAuthenticated(req, res, () => {
      if (injectUserIdHeader) {
        req.headers[syscfg.USER_ID_HEADER] = req.user?.id;
      }
      next();
    });
  };
}
