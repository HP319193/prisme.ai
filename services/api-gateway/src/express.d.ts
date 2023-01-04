declare namespace Express {
  export interface Request {
    context: PrismeContext;
    logger: Logger;
    service: string;
    user?: Prismeai.User;
    broker: import('@prisme.ai/broker').Broker;
    session: import('express-session').Session &
      Partial<import('express-session').SessionData> &
      CustomSessionFields;
  }

  interface CustomSessionFields {
    prismeaiSessionId: string;
    missingMFA?: boolean;
  }
}
