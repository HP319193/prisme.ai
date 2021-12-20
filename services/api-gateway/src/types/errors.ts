export class PrismeError extends Error {
  public error: string;
  public details: any;
  public httpCode: number;

  constructor(message: string, details: any, httpCode: number) {
    super(message);
    this.error = this.constructor.name;
    this.details = details;
    this.httpCode = httpCode;
  }
}

export class ConfigurationError extends PrismeError {
  constructor(msg: string, details: any) {
    super(msg, details, 500);
  }
}

export class ForbiddenError extends PrismeError {
  constructor() {
    super("Forbidden", undefined, 403);
  }
}

export class AuthenticationError extends PrismeError {
  constructor() {
    super("Missing or invalid token", undefined, 401);
  }
}
