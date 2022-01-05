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
  constructor(msg = "Unauthenticated") {
    super(msg, undefined, 401);
  }
}
export class RequestValidationError extends PrismeError {
  constructor(msg: string, details: any[] = []) {
    super(msg, details, 400);
  }
}

export class NotFoundError extends PrismeError {
  constructor() {
    super("Route not found", undefined, 404);
  }
}

export class AlreadyUsed extends PrismeError {
  constructor(type: string) {
    super(`${type} already in use`, undefined, 400);
  }
}

export class InvalidEmail extends PrismeError {
  constructor() {
    super(`value must be an email`, undefined, 400);
  }
}
