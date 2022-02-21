'use strict';

import { NextFunction, RequestHandler, Response } from 'express';
import { Request } from 'express-serve-static-core';

export const asyncRoute =
  (fn: RequestHandler<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
