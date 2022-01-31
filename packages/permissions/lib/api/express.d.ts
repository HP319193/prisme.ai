declare namespace Express {
  export interface Request {
    accessManager: Required<
      import("../accessManager").AccessManager<string, Record<string, any>>
    >;
  }
}
