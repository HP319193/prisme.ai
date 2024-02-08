import archiver from 'archiver';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import {
  DriverType,
  ExportOptions,
  GetOptions,
  IStorage,
  ObjectList,
  SaveOptions,
  Streamed,
} from '../types';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';
import path from 'path';
import stream from 'stream';
import { streamToBuffer } from '../../utils/streamToBuffer';

export interface AzureBlobOptions {
  connectionString: string;
  container: string;
  baseUrl?: string;
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
        ret.push({
          key: blob.name.slice(path.length + 1),
        });
      }
      return ret;
    } catch (err) {
      throw err;
    }
  }

  public async get(key: string, opts?: GetOptions) {
    try {
      const blobClient = this.client.getBlockBlobClient(key);
      const content = await blobClient.download(0);
      if (opts?.stream) {
        content.readableStreamBody?.pipe(opts?.stream);
        return Streamed;
      } else {
        return streamToBuffer(content.readableStreamBody as stream.Readable);
      }
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
              msg: 'Failed to delete remaining azure blob directories after delete operation',
              err: err.details,
            });
            break;
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

  async deleteMany(keys: string[]) {
    return await Promise.all(
      keys.map((key) => {
        return this.delete(key);
      })
    );
  }

  public async save(key: string, data: any, opts?: SaveOptions) {
    // Azure does not support object level ACL
    if (data === undefined && typeof opts?.public !== 'undefined') {
      return;
    }
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

  public async copy(from: string, to: string) {
    const objects = await this.find(from, true);
    const copyPaths = objects.map(({ key }) => ({
      from: key,
      to: from === key ? to : path.join(to, key.slice(from.length)),
    }));
    await Promise.all(
      copyPaths.map(async ({ from, to }) => {
        try {
          const destBlob = this.client.getBlockBlobClient(to);
          const sourceBlob = this.client.getBlobClient(from);
          const copyPoller = await destBlob.beginCopyFromURL(sourceBlob.url, {
            intervalInMs: 500,
          });
          return await copyPoller.pollUntilDone();
        } catch (err: any) {
          throw new PrismeError(
            `Failed to copy from '${from}' to '${to}'`,
            err.details,
            ErrorSeverity.Fatal
          );
        }
      })
    );
  }

  async export(
    prefix: string,
    outStream?: stream.Writable,
    opts?: ExportOptions
  ) {
    const { format, exclude = [] } = opts || {};
    const keys = await this.find(prefix, true);
    const archive = archiver((format as any) || 'zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    let completionPromise: Promise<typeof Streamed | Buffer>;
    if (outStream) {
      archive.pipe(outStream);
      completionPromise = Promise.resolve(Streamed);
    } else {
      completionPromise = streamToBuffer(archive);
    }

    await Promise.all(
      keys.map(async ({ key }) => {
        if (exclude.some((cur) => key.endsWith(cur))) {
          return;
        }
        return await this.get(key).then((body) => {
          archive.append(body as Buffer, {
            name: key.slice(path.dirname(prefix).length),
          });
        });
      })
    );

    archive.finalize();
    return completionPromise;
  }
}
