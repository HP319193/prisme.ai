import { LogLevel } from "../logger";

export * from "./handlers";

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
  constructor(msg: string = "Object not found", details?: any) {
    super(msg, details);
  }
}

export class TooManyCallError extends PrismeError {
  constructor(
    msg: string = "Reached maximum number of successive calls",
    details: { limit: number }
  ) {
    super(msg, details);
  }
}
export class InvalidEventError extends PrismeError {
  constructor(msg: string = "Trying to send an invalid event", details?: any) {
    super(msg, details);
  }
}

export class InvalidVariableNameError extends PrismeError {
  constructor(
    msg: string = "Invalid variable name. Only allowed characters are : a-z, A-Z, 0-9, '_' et '-'.",
    details?: any
  ) {
    super(msg, details);
  }
}

export class InvalidSetInstructionError extends PrismeError {
  constructor(msg: string = "Invalid set instruction", details?: any) {
    super(msg, details);
  }
}

export class InvalidConditionSyntax extends PrismeError {
  constructor(msg: string = "Invalid syntax in a condition", details?: any) {
    super(msg, details);
  }
}
