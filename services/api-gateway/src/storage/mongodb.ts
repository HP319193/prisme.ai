import { StorageDriver, SaveOpts, StorageOptions, FindOpts } from '.';
import {
  Collection,
  Db,
  Document,
  MongoClient,
  MongoClientOptions,
  ObjectId,
  WithId,
} from 'mongodb';
import { eda } from '../config';
import { logger } from '../logger';

export class MongodbDriver implements StorageDriver<any> {
  private client: MongoClient;
  private collectionName: string;
  private db?: Db;
  private _collection?: Collection;
  private opts: StorageOptions;

  constructor(collectionName: string, opts: StorageOptions) {
    const { host, driverOptions } = opts;

    const mongoOpts = {
      appName: `${process.env.HOSTNAME || eda.APP_NAME}-${collectionName}`,
      socketTimeoutMS: 60 * 1000, // Close sockets after 60 secs of inactivity
      maxPoolSize: 30,
      ...(driverOptions as MongoClientOptions),
    };
    this.client = new MongoClient(host, mongoOpts);
    this.collectionName = collectionName;
    this.opts = opts;
  }

  async connect() {
    await this.client.connect();
    this.db = await this.client.db();
    this._collection = await this.db.collection(this.collectionName);
    if (this.opts?.indexes?.length) {
      this.ensureIndexes(this.opts.indexes);
    }
  }

  private async ensureIndexes(indexes: string[]) {
    try {
      await Promise.all(
        indexes.map((name) =>
          this._collection?.createIndex({
            [name]: 1,
          })
        )
      );
    } catch (err) {
      logger.error({
        msg:
          'Could not ensure indexes from MongoDB collection ' +
          this.collectionName,
        err,
      });
    }
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

  async find(query: Record<string, string>, opts?: FindOpts) {
    const collection = await this.collection();

    const limit = opts?.limit || 50;
    const skip = (opts?.page || 0) * limit;
    const result = await collection.find(query).skip(skip).limit(limit);
    return (await result.toArray()).map((cur) => this.prepareData(cur));
  }

  async count(query: Record<string, string>) {
    const collection = await this.collection();
    return await collection.count(query);
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
