import { Broker } from '@prisme.ai/broker';
import { NextFunction, Request, Response } from 'express';
import { AccessManager } from '../..';

export type InstantiatedAccessManager<SubjectType extends string> = Required<
  AccessManager<SubjectType, { [k in SubjectType]: any }, Prismeai.Role>
>;
export type ExtendedRequest<SubjectType extends string> = {
  accessManager: InstantiatedAccessManager<SubjectType>;
  broker: Broker;
};

export const asyncRoute =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
