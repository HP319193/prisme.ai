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

export class ConfigurationError extends PrismeError {
  constructor(msg: string, details: any) {
    super(msg, details, ErrorSeverity.Fatal);
  }
}

export class SearchError extends PrismeError {
  constructor(msg: string, details?: any) {
    super(msg, details);
  }
}
export class ForbiddenError extends PrismeError {
  constructor(msg: string = 'Unauthorized access') {
    super(msg, {});
  }
}
