import { LogLevel } from '../logger';

export * from './handlers';

export enum ErrorSeverity {
  Fatal = LogLevel.Fatal,
  Error = LogLevel.Error,
  Warning = LogLevel.Warning,
}

export interface PrismeError {
  error: string;
  message: string;
  level?: ErrorSeverity;
}

export class PrismeError extends Error implements PrismeError {
  public error: string;
  public details: any;
  public severity: ErrorSeverity;

  constructor(message: string, details: any, severity?: ErrorSeverity) {
    super(message);
    this.error = this.constructor.name;
    this.details = details;
    this.severity = severity || ErrorSeverity.Error;
  }

  toJSON() {
    return {
      error: this.error,
      message: this.message,
      details: this.details,
    };
  }
}

export class ObjectNotFoundError extends PrismeError {
  constructor(msg: string = 'Object not found', details?: any) {
    super(msg, details);
  }
}

export class AlreadyUsedError extends PrismeError {
  constructor(msg: string = 'Already used', details?: any) {
    super(msg, details);
  }
}

export class MissingFieldError extends PrismeError {
  constructor(msg: string = 'Missing field', details?: any) {
    super(msg, details);
  }
}

export class InvalidSlugError extends PrismeError {
  constructor(slug: string) {
    super(
      `Invalid slug '${slug} : only allowed characters are letters, numbers, whitespaces, . _ and -'`,
      {}
    );
  }
}

export class InvalidVersionError extends PrismeError {
  constructor(msg: string) {
    super(msg, {});
  }
}

export class InvalidUploadError extends PrismeError {
  constructor(msg: string, details: any = {}) {
    super(msg || 'Invalid uploaded file', details);
  }
}
