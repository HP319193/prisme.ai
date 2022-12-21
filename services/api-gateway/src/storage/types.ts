export interface StorageOptions {
  driver: string;
  host: string;
  password?: string;
  driverOptions: any;
}

export interface StorageDriver<Model> {
  connect(): Promise<void>;
  close(): Promise<void>;

  save(data: Model): Promise<Model>;
  get(id: string): Promise<Model>;
  find(query: Partial<Model> & Record<string, any>): Promise<Model[]>;
  delete(id: string): Promise<boolean>;
}
