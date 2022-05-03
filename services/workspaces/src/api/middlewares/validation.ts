import { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { HttpError } from 'express-openapi-validator/dist/framework/types';
import { DEBUG, OPENAPI_FILEPATH } from '../../../config';
import { PrismeError } from '../../errors';

interface ValidationOpts {
  ignorePaths?: string[];
}
export const validationMiddleware = ({ ignorePaths = [] }: ValidationOpts) => {
  const ignoreRegexps = ignorePaths.map((regexp) => new RegExp(regexp));

  return OpenApiValidator.middleware({
    apiSpec: OPENAPI_FILEPATH,
    validateRequests: true,
    validateResponses: DEBUG,
    validateSecurity: false,
    ignorePaths: !ignorePaths.length
      ? undefined
      : (path: string) => {
          return ignoreRegexps.some((cur) => cur.test(path));
        },
  });
};

export class RequestValidationError extends PrismeError {
  constructor(msg: string, details: any[] = []) {
    super(msg, details);
  }
}

export const validationErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    next(new RequestValidationError(err.message, err.errors));
  } else {
    next(err);
  }
};
