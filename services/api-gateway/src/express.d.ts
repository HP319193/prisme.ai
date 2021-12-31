declare namespace Express {
  export interface Request {
    context: PrismeContext;
    logger: Logger;
    service: string;
    user?: Prismeai.User;
    broker: Broker;
  }
}
