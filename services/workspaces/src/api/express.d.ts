declare namespace Express {
  export interface Request {
    context: PrismeContext;
    logger: Logger;
    broker: Broker;
  }
}
