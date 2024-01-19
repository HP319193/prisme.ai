import archiver from 'archiver';
import {
  DriverType,
  ExportOptions,
  GetOptions,
  IStorage,
  ObjectList,
  SaveOptions,
  Streamed,
} from '../types';
import AWS from 'aws-sdk';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';
import path from 'path';
import stream from 'stream';
import { streamToBuffer } from '../../utils/streamToBuffer';

export interface S3Options {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  cacheControl?: string;
  baseUrl?: string;
  endpoint?: string;
}

const defaultS3Options: Partial<S3Options> = {
  cacheControl: 'public, max-age=31536000',
};

export default class S3Like implements IStorage {
  private client: AWS.S3;
  private options: S3Options;

  public constructor(options: S3Options) {
    this.options = { ...defaultS3Options, ...options };
    this.client = new AWS.S3({
      accessKeyId: this.options.accessKeyId,
      secretAccessKey: this.options.secretAccessKey,
      params: {
        Bucket: this.options.bucket,
        CacheControl: this.options.cacheControl,
      },
      region: this.options.region,
      endpoint: this.options.endpoint,
    });
  }

  type() {
    return DriverType.S3_LIKE;
  }

  public find(
    prefix: string,
    fullKeys?: boolean,
    continuationToken?: string,
    out: ObjectList = []
  ): Promise<ObjectList> {
    return new Promise((resolve, reject) => {
      this.client
        .listObjectsV2({
          Bucket: this.options.bucket,
          ContinuationToken: continuationToken,
          Prefix: prefix,
        })
        .promise()
        .then(({ Contents, IsTruncated, NextContinuationToken }) => {
          out.push(
            ...(Contents || [])
              .filter((cur) => cur.Key)
              .map((cur) => {
                if (fullKeys) {
                  return { key: cur.Key!! };
                }
                const splittedKey = cur.Key!!?.split('/');
                return {
                  key: splittedKey[splittedKey.length - 1],
                };
              })
          );
          !IsTruncated
            ? resolve(out)
            : resolve(this.find(prefix, fullKeys, NextContinuationToken, out));
        })
        .catch(reject);
    });
  }

  public get(key: string, opts?: GetOptions) {
    return new Promise<Buffer>((resolve: any, reject: any) => {
      const getReq = this.client.getObject(
        {
          Key: key,
          Bucket: this.options.bucket,
        },
        function (err: any, data) {
          if (err) {
            reject(new ObjectNotFoundError());
          } else {
            resolve(opts?.stream ? Streamed : data.Body);
          }
        }
      );

      if (opts?.stream) {
        getReq.createReadStream().pipe(opts?.stream);
      }
    });
  }

  public delete(key: string) {
    return new Promise((resolve: any, reject: any) => {
      this.client.listObjects(
        {
          Prefix: key,
          Bucket: this.options.bucket,
        },
        (error: any, data: any) => {
          if (error) {
            reject(
              new PrismeError(
                'Failed to list files before deletion',
                error,
                ErrorSeverity.Fatal
              )
            );
          } else if (data && data.Contents) {
            Promise.all(
              data.Contents.map(
                ({ Key }: any) =>
                  new Promise((resolve, reject) => {
                    this.client.deleteObject(
                      { Key: Key as any, Bucket: this.options.bucket },
                      (err: any, data: any) => {
                        if (err) {
                          reject(
                            new PrismeError(
                              'Failed to delete file',
                              err,
                              ErrorSeverity.Fatal
                            )
                          );
                        }
                        resolve(data);
                      }
                    );
                  })
              )
            )
              .then(resolve)
              .catch(reject);
          }
        }
      );
      this.client.deleteObject(
        {
          Key: key,
          Bucket: this.options.bucket,
        },
        function (err: any, data: any) {
          if (err) {
            reject(
              new PrismeError('Failed to delete file', err, ErrorSeverity.Fatal)
            );
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  async deleteMany(keys: string[]) {
    return await Promise.all(
      keys.map((key) => {
        return this.delete(key);
      })
    );
  }

  public async save(key: string, data: any, opts?: SaveOptions) {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.options.bucket,
      Key: key,
      Body: data,
      CacheControl: this.options.cacheControl,
      ContentType: opts?.mimetype,
      ACL: opts?.public ? 'public-read' : 'private',
    };

    const result = await new Promise((resolve: any, reject: any) => {
      this.client.putObject(params, function (err: any, data: any) {
        if (err) {
          reject(
            new PrismeError('Failed to save file', err, ErrorSeverity.Fatal)
          );
        } else {
          resolve(data);
        }
      });
    });
    try {
      await this.waitForObjectPropagation(key);
    } catch {}
    return result;
  }

  public async copy(from: string, to: string) {
    const objects = await this.find(from, true);
    // If we do not replace whitespaces with +, API raised an error upon double whitespaces
    const copyPaths = objects.map(({ key }) => ({
      CopySource: `/${this.options.bucket}/${key}`.replace(/(\s)/g, '+'),
      Key: from === key ? to : path.join(to, key.slice(from.length)),
    }));
    const result = await Promise.all(
      copyPaths.map(
        (copy) =>
          new Promise((resolve: any, reject: any) => {
            this.client.copyObject(
              {
                Bucket: this.options.bucket,
                CacheControl: this.options.cacheControl,
                ...copy,
              },
              function (err: any, data: any) {
                if (err) {
                  reject(
                    new PrismeError(
                      `Failed to copy from '${copy.CopySource}' to '${copy.Key}'`,
                      err,
                      ErrorSeverity.Fatal
                    )
                  );
                } else {
                  resolve(data);
                }
              }
            );
          })
      )
    );
    try {
      await this.waitForObjectPropagation(copyPaths[copyPaths.length - 1].Key);
    } catch {}
    return result;
  }

  private async waitForObjectPropagation(
    path: string,
    delay = 300,
    maxWait = 2000
  ) {
    let waited = 0;
    do {
      try {
        await this.get(path);
        return;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, delay));
      waited += delay;
    } while (waited < maxWait);
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
          archive.append(body, {
            name: key.slice(path.dirname(prefix).length),
          });
        });
      })
    );

    archive.finalize();
    return completionPromise;
  }
}
