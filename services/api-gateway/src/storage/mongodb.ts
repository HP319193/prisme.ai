import { StorageDriver, SaveOpts } from '.';
import {
  Collection,
  Db,
  Document,
  MongoClient,
  MongoClientOptions,
  ObjectId,
  WithId,
} from 'mongodb';

export class MongodbDriver implements StorageDriver<any> {
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

  async save(data: any, opts: SaveOpts<any>) {
    const { _id, id, ...object } = data;
    const collection = await this.collection();

    if (opts?.upsertQuery) {
      await collection.updateOne(
        opts?.upsertQuery,
        { $set: data },
        {
          upsert: true,
        }
      );
    } else if (_id || id) {
      await collection.updateOne(
        { _id: new ObjectId(_id || id) },
        { $set: object }
      );
    } else {
      await collection.insertOne(data);
    }

    return this.prepareData(data);
  }

  async get(id: string) {
    const collection = await this.collection();
    const document = await collection.findOne({ _id: new ObjectId(id) });
    return this.prepareData(document);
  }

  async find(query: Record<string, string>) {
    const collection = await this.collection();
    const result = await collection.find(query);
    return (await result.toArray()).map((cur) => this.prepareData(cur));
  }

  async delete(id: string | Record<string, any>): Promise<boolean> {
    const collection = await this.collection();
    const query = typeof id == 'object' ? id : { _id: new ObjectId(id) };
    const result = await collection.deleteOne(query);
    return result.acknowledged;
  }

  prepareData(data: WithId<Document> | null) {
    if (!data) {
      return data;
    }

    const savedData: any = {
      ...data,
      id: `${data._id}`,
    };
    delete savedData._id;
    return savedData;
  }
}
