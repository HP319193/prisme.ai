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
  fileCallback?: (filepath: string) => { filepath: string } | false;
}

export interface ImportOptions {
  archive?: boolean; // archive=true is the only mode supported
  removeAdditionalFiles?: boolean; // If true, remove files that were not present in archive content
  description?: any; // Optional, human readable note describing the import content that may or may not be saved by underlying storage driver (i.e git commits)
  fileCallback?: (filepath: string) => { filepath: string } | false;
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
  import(
    subkey: string,
    stream: stream.Readable,
    opts?: ImportOptions
  ): Promise<boolean>;
}

export enum DriverType {
  S3_LIKE = 'S3_LIKE',
  AZURE_BLOB = 'AZURE_BLOB',
  FILESYSTEM = 'FILESYSTEM',
  GIT = 'GIT',
}
