export enum ErrorLevel {
  Warning = 'warning',
  Fatal = 'fatal',
}

export interface BrokerError {
  error: string;
  message: string;
  details: any;
}
export class BrokerError extends Error implements BrokerError {
  public error: string;
  public details: any;

  constructor(message: string, details: any) {
    super(message);
    this.error = 'BrokerError';
    this.message = message;
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

export class EventValidationError extends BrokerError {
  constructor(msg: string, details: any) {
    super(msg, details);
  }
}
