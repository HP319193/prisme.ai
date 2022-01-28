export interface PrismeError {
  error: string;
  message: string;
}

export class PrismeError extends Error implements PrismeError {
  public error: string;
  public details: any;

  constructor(message: string, details: any) {
    super(message);
    this.error = this.constructor.name;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.error,
      message: this.message,
      details: this.details,
    };
  }
}

export class ForbiddenError extends PrismeError {
  constructor(msg: string = "Unauthorized access", details?: any) {
    super(msg, details);
  }
}

export class UnknownRole extends PrismeError {
  constructor(msg: string = "Unknown role", details?: any) {
    super(msg, details);
  }
}

export class ObjectNotFoundError extends PrismeError {
  constructor(msg: string = "Object not found") {
    super(msg, []);
  }
}
