import { Broker } from "@prisme.ai/broker";
import { NextFunction, Request, Response } from "express";
import { AccessManager } from "../..";

export type InstantiatedAccessManager<
  SubjectType extends string,
  CustomRules = any
> = Required<
  AccessManager<
    SubjectType,
    { [k in SubjectType]: any },
    Prismeai.Role,
    CustomRules
  >
>;
export type ExtendedRequest<SubjectType extends string, CustomRules = any> = {
  accessManager: InstantiatedAccessManager<SubjectType, CustomRules>;
  broker: Broker;
};

export const asyncRoute =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
