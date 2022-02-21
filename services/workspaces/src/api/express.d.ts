declare namespace Express {
  export interface Request {
    context: import('./middlewares/traceability').PrismeContext;
    logger: import('../logger').Logger;
    broker: import('@prisme.ai/broker').Broker;
    accessManager: Required<import('../permissions').AccessManager>;
  }
}
