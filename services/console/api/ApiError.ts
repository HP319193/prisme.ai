export class ApiError extends Error implements Prismeai.GenericError {
  public code: number;
  public error: Prismeai.GenericError['error'];
  public details: Prismeai.GenericError['details'];

  constructor(
    { error, message, details }: Prismeai.GenericError,
    code: number
  ) {
    super(message);
    this.code = code;
    this.error = error;
    this.details = details;
  }

  toString() {
    return this.error;
  }
}

export default ApiError;
