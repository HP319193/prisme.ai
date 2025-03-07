export interface PrismeError {
  error: string;
  message: string;
}

export class PrismeError extends Error implements PrismeError {
  public error: string;
  public details: any;

  constructor(message: string, details: any = {}, code?: string) {
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
  constructor(msg: string = 'Unauthorized access', details?: any) {
    super(msg, details, 'ForbiddenError');
  }
}

export class UnknownRole extends PrismeError {
  constructor(msg: string = 'Unknown role', details?: any) {
    super(msg, details, 'UnknownRole');
  }
}

export class UnknownSubjectType extends PrismeError {
  constructor(msg: string = 'Unknown subject type', details?: any) {
    super(msg, details, 'UnknownSubjectType');
  }
}

export class InvalidPermissions extends PrismeError {
  constructor(msg: string = 'Invalid collaborator', details?: any) {
    super(msg, details, 'InvalidPermissions');
  }
}

export class ObjectNotFoundError extends PrismeError {
  constructor(msg: string = 'Object not found', details?: any) {
    super(msg, details || [], 'ObjectNotFoundError');
  }
}

export class CollaboratorNotFound extends PrismeError {
  constructor(msg: string = "Can't find this collaborator") {
    super(msg, [], 'CollaboratorNotFound');
  }
}
export class InvalidAPIKey extends PrismeError {
  constructor(msg: string = 'Invalid API Key') {
    super(msg, [], 'InvalidAPIKey');
  }
}
