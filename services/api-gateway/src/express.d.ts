declare namespace Express {
  export interface Request {
    context: PrismeContext;
    logger: Logger;
    service: string;
  }
}
