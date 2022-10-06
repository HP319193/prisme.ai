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

  toJSON() {
    return {
      error: this.error,
      message: this.message,
      details: this.details,
    };
  }
}

export class ConfigurationError extends PrismeError {
  constructor(msg: string, details: any) {
    super(msg, details, 500);
  }
}

export class ForbiddenError extends PrismeError {
  constructor() {
    super('Forbidden', undefined, 403);
  }
}

export class AuthenticationError extends PrismeError {
  constructor(msg = 'Incorrect email or password.') {
    super(msg, undefined, 401);
  }
}

export class ValidateEmailError extends PrismeError {
  constructor(msg = 'Please verify your email') {
    super(msg, undefined, 401);
  }
}
export class RequestValidationError extends PrismeError {
  constructor(msg: string, details: any[] = []) {
    super(msg, details, 400);
  }
}

export class NotFoundError extends PrismeError {
  constructor(msg: string = 'Route not found', details?: any) {
    super(msg, details, 404);
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

export class InvalidPassword extends PrismeError {
  constructor(msg: string = `Invalid password`) {
    super(msg, undefined, 400);
  }
}

export class InvalidOrExpiredToken extends PrismeError {
  constructor(msg: string = `Invalid or expired token`) {
    super(msg, undefined, 400);
  }
}

export class PayloadTooLarge extends PrismeError {
  constructor(length: number, limit: number) {
    super(
      `request too large`,
      {
        length,
        limit,
      },
      413
    );
  }
}
