import { Data, SavedData, Query, StorageDriver } from ".";
import {
  MongoClient,
  MongoClientOptions,
  Db,
  Document,
  Collection,
  ObjectId,
  WithId,
} from "mongodb";

export class MongodbDriver implements StorageDriver {
  private client: MongoClient;
  private collectionName: string;
  private db?: Db;
  private _collection?: Collection;

  constructor(url: string, opts: MongoClientOptions, collectionName: string) {
    this.client = new MongoClient(url, opts);
    this.collectionName = collectionName;
  }

  async connect() {
    await this.client.connect();
    this.db = await this.client.db();
    this._collection = await this.db.collection(this.collectionName);
  }

  private async collection() {
    if (!this._collection) {
      await this.connect();
    }
    return this._collection!!;
  }

  async close() {
    return await this.client.close();
  }

  async save(data: Data): Promise<SavedData> {
    const collection = await this.collection();
    await collection.insertOne(data);
    return this.prepareData(data);
  }

  async get(id: string): Promise<SavedData> {
    const collection = await this.collection();
    const document = await collection.findOne({ _id: new ObjectId(id) });
    return this.prepareData(document);
  }

  async find(query: Query): Promise<SavedData> {
    const collection = await this.collection();
    const result = await collection.find(query);
    return (await result.toArray()).map((cur) => this.prepareData(cur));
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.collection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.acknowledged;
  }

  prepareData(data: WithId<Document> | null) {
    if (!data) {
      return data;
    }

    const savedData: SavedData = {
      ...data,
      id: `${data._id}`,
    };
    delete savedData._id;
    return savedData;
  }
}
