export type Data = any;
export type Query = any;
export type SavedData = Data & { id: string };

export interface StorageOptions {
  driver: string;
  host: string;
  driverOptions: any;
}

export interface StorageDriver {
  connect(): Promise<void>;
  close(): Promise<void>;

  save(data: Data): Promise<SavedData>;
  get(id: string): Promise<SavedData>;
  find(query: Query): Promise<SavedData[]>;
  delete(id: string): Promise<boolean>;
}
