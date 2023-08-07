import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DriverType, IStorage, ObjectList, SaveOptions } from '../types';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';
import stream from 'stream';
import { streamToBuffer } from '../../utils/streamToBuffer';

export interface AzureBlobOptions {
  connectionString: string;
  container: string;
}

export default class AzureBlob implements IStorage {
  private client: ContainerClient;

  public constructor(options: AzureBlobOptions) {
    this.client = BlobServiceClient.fromConnectionString(
      options.connectionString
    ).getContainerClient(options.container);
  }

  type() {
    return DriverType.AZURE_BLOB;
  }

  public async find(
    path: string,
    fullKeys?: boolean,
    opts?: { resourceType?: string }
  ): Promise<ObjectList> {
    const { resourceType = 'file' } = opts || {};
    try {
      const it = await this.client.listBlobsFlat({
        prefix: path,
        includeLegalHold: false,
      });
      const ret = [];
      for await (let blob of it) {
        if (
          (<any>blob.properties).ResourceType &&
          (<any>blob.properties).ResourceType !== resourceType
        ) {
          continue;
        }
        if (fullKeys) {
          ret.push({ key: blob.name });
          continue;
        }
        const splittedKey = blob.name?.split('/');
        ret.push({
          key: splittedKey[splittedKey.length - 1],
        });
      }
      return ret;
    } catch (err) {
      throw err;
    }
  }

  public async get(key: string) {
    try {
      const blobClient = this.client.getBlockBlobClient(key);
      const content = await blobClient.download(0);
      return streamToBuffer(content.readableStreamBody as stream.Readable);
    } catch {
      throw new ObjectNotFoundError();
    }
  }

  public async delete(key: string) {
    try {
      const [files, directories] = await Promise.all([
        this.find(key, true, { resourceType: 'file' }),
        // Remove ending / as it would exclude target directory itself
        this.find(key.endsWith('/') ? key.slice(0, -1) : key, true, {
          resourceType: 'directory',
        }),
      ]);
      await Promise.all(files.map(({ key }) => this.client.deleteBlob(key)));

      // Delete directory blobs asynchronously
      setTimeout(async () => {
        const sortedDirectories = directories.sort((a, b) =>
          a.key.split('/').length > b.key.split('/').length ? -1 : 1
        );
        for (let { key } of sortedDirectories) {
          try {
            await this.client.deleteBlob(key);
          } catch (err: any) {
            console.error({
              msg: 'Failed to delete remaining azure blocks after delete operation',
              err: err.details,
            });
          }
        }
      }, 2000);
    } catch (err: any) {
      throw new PrismeError(
        'Failed to delete file',
        err.details,
        ErrorSeverity.Fatal
      );
    }
  }

  public async save(key: string, data: any, opts?: SaveOptions) {
    try {
      const blobClient = this.client.getBlockBlobClient(key);
      await blobClient.upload(data, data.length, {
        blobHTTPHeaders: {
          blobContentType: opts?.mimetype,
        },
      });
    } catch (err: any) {
      throw new PrismeError(
        'Failed to save file',
        err.details,
        ErrorSeverity.Fatal
      );
    }
  }
}
