declare namespace Express {
  export interface Request {
    context: PrismeContext;
    logger: import('../logger').Logger;
    broker: import('@prisme.ai/broker').Broker;
    accessManager: Required<import('../permissions').AccessManager>;
    authData?: Prismeai.User['authData'];
  }
}
