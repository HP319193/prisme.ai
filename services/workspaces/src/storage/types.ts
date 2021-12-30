export interface Storage {
  get(id: string): any;

  save(id: string, data: any): Promise<any>;

  delete(id: string): any;
}

export enum DriverType {
  S3_LIKE = 'S3_LIKE',
  FILESYSTEM = 'FILESYSTEM',
}
