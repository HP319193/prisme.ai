import { RequestHandler } from 'express';
import { GatewayConfig } from '../config';

import * as proxy from './proxy';
import * as authentication from './authentication';
import * as blacklist from './blacklist';

export enum PolicyType {
  Proxy = 'proxy',
  PrismeAuth = 'authentication',
  Blacklist = 'blacklist',
}

export interface Policies {
  [PolicyType.Proxy]: proxy.Params;
  [PolicyType.PrismeAuth]: authentication.Params;
  [PolicyType.Blacklist]: blacklist.Params;
}

export const policiesValidatorSchema: {
  [k in PolicyType]: any;
} = {
  [PolicyType.Proxy]: proxy.validatorSchema,
  [PolicyType.PrismeAuth]: authentication.validatorSchema,
  [PolicyType.Blacklist]: blacklist.validatorSchema,
};

const policies: {
  [k in PolicyType]: (
    params: any,
    gtwcfg: GatewayConfig
  ) => Promise<RequestHandler>;
} = {
  [PolicyType.Proxy]: proxy.init,
  [PolicyType.PrismeAuth]: authentication.init,
  [PolicyType.Blacklist]: blacklist.init,
};

export function buildMiddleware(policy: Policies, gtwcfg: GatewayConfig) {
  const name = Object.keys(policy)[0] as PolicyType;
  const params = policy[name];
  return policies[name](params, gtwcfg) as any as RequestHandler;
}
