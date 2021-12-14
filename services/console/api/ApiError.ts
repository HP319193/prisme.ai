import { APIError } from "../../../packages/types";

export class ApiError extends Error implements APIError {
  public code: number;
  public error: APIError["error"];
  public details: APIError["details"];

  constructor({ error, message, details }: APIError, code: number) {
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
