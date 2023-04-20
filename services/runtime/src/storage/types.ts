export type ObjectList = {
  key: string;
}[];

export interface IStorage {
  get(id: string): any;
  find(prefix: string): Promise<ObjectList>;

  save(id: string, data: any): Promise<any>;

  delete(id: string): any;
}

export enum DriverType {
  S3_LIKE = 'S3_LIKE',
  FILESYSTEM = 'FILESYSTEM',
}
