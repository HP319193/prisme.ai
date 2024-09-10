import { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { HttpError } from 'express-openapi-validator/dist/framework/types';
import { syscfg } from '../config';
import { NotFoundError, RequestValidationError } from '../types/errors';

interface ValidationOpts {
  ignorePaths?: string[];
}
export const validationMiddleware = ({ ignorePaths = [] }: ValidationOpts) => {
  const ignoreRegexps = ignorePaths.map((regexp) => new RegExp(regexp));

  return OpenApiValidator.middleware({
    apiSpec: syscfg.OPENAPI_FILEPATH,
    validateRequests: true,
    validateResponses: false,
    validateSecurity: false,
    ignorePaths: !ignorePaths.length
      ? undefined
      : (path: string) => {
          return ignoreRegexps.some((cur) => cur.test(path));
        },
  });
};

export const validationErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    if (err.message === 'not found') {
      next(new NotFoundError());
    } else {
      next(new RequestValidationError(err.message, err.errors));
    }
  } else {
    next(err);
  }
};

export async function cleanIncomingRequest(req: Request) {
  for (let header in req.headers) {
    if (
      header.startsWith('x-prismeai-') &&
      !syscfg.ALLOWED_PRISMEAI_HEADERS_FROM_OUTSIDE.includes(header)
    ) {
      delete req.headers[header];
    }
  }
}
