export interface PrismeError {
  error: string;
  message: string;
}

export class PrismeError extends Error implements PrismeError {
  public error: string;
  public details: any;

  constructor(message: string, details: any, code?: string) {
    super(message);
    this.error = code || this.constructor.name;
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
    super(msg, details, "ForbiddenError");
  }
}

export class UnknownRole extends PrismeError {
  constructor(msg: string = "Unknown role", details?: any) {
    super(msg, details, "UnknownRole");
  }
}

export class UnknownSubjectType extends PrismeError {
  constructor(msg: string = "Unknown subject type", details?: any) {
    super(msg, details, "UnknownSubjectType");
  }
}

export class ObjectNotFoundError extends PrismeError {
  constructor(msg: string = "Object not found") {
    super(msg, [], "ObjectNotFoundError");
  }
}
