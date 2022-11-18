export type ObjectList = {
  key: string;
}[];
export interface IStorage {
  type(): DriverType;

  get(id: string): Promise<any>;
  find(prefix: string): Promise<ObjectList>;

  save(id: string, data: any): Promise<any>;
  copy(from: string, to: string): Promise<any>;

  delete(id: string): any;
  deleteMany(ids: string[]): any;
}

export enum DriverType {
  S3_LIKE = 'S3_LIKE',
  FILESYSTEM = 'FILESYSTEM',
}
