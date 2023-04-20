import { IStorage, ObjectList } from '../types';
import AWS from 'aws-sdk';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';

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

  public get(key: string) {
    return new Promise((resolve: any, reject: any) => {
      this.client.getObject(
        {
          Key: key,
          Bucket: this.options.bucket,
        },
        function (err: any, data: any) {
          if (err) {
            reject(new ObjectNotFoundError('Object not found : ' + key));
          } else {
            resolve(data.Body);
          }
        }
      );
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

  public save(key: string, data: any) {
    const params = {
      Bucket: this.options.bucket,
      Key: key,
      Body: data,
      CacheControl: this.options.cacheControl,
    };
    return new Promise((resolve: any, reject: any) => {
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
  }
}
