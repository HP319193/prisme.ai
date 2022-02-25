export class HTTPError extends Error {
  public code: number;
  constructor(status: string, code: number) {
    super(status);
    this.code = code;
  }

  toString() {
    return `${this.code} ${this.message}`;
  }
}

export default HTTPError;
