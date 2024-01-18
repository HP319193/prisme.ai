import stream from 'stream';

export type ObjectList = {
  key: string;
}[];

export interface GetOptions {
  stream?: stream.Writable;
}

export interface SaveOptions {
  mimetype?: string;
  public?: boolean;
}

export interface ExportOptions {
  format?: string;
  exclude?: string[];
}

export const Streamed = Symbol('streamed');

export interface IStorage {
  type(): DriverType;

  get(id: string, opts?: GetOptions): Promise<any | typeof Streamed>;
  find(prefix: string): Promise<ObjectList>;

  save(id: string, data: any, options?: SaveOptions): Promise<any>;
  copy(from: string, to: string): Promise<any>;

  delete(id: string): any;
  deleteMany(ids: string[]): any;

  export(
    prefix: string,
    outStream?: stream.Writable,
    opts?: ExportOptions
  ): Promise<Buffer | typeof Streamed>;
}

export enum DriverType {
  S3_LIKE = 'S3_LIKE',
  AZURE_BLOB = 'AZURE_BLOB',
  FILESYSTEM = 'FILESYSTEM',
}
