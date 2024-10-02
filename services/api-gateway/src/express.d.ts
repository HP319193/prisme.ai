declare namespace Express {
  export interface Request {
    context: PrismeContext;
    logger: Logger;
    service: string;
    user?: Prismeai.User;
    broker: import('@prisme.ai/broker').Broker;
    session:
      | (import('express-session').Session &
          Partial<import('express-session').SessionData> &
          CustomSessionFields)
      | Omit<CustomSessionFields, 'passport'>;
    locals: {
      authScheme?: 'cookie' | 'bearer';
      [k: string]: any;
    };
    authError?: string;
  }

  interface CustomSessionFields {
    prismeaiSessionId: string;
    expires?: string;
    mfaValidated?: boolean;
    passport: {
      user: string;
    };
    authData?: Prismeai.AuthData;
    auth?: {
      provider?: string;
    };
    csrfToken?: string;
  }
}
