import { IStorage } from "../types";
import AWS from "aws-sdk";
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from "../../errors";

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
  cacheControl: "public, max-age=31536000",
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

  public get(key: string) {
    return new Promise((resolve: any, reject: any) => {
      this.client.getObject(
        {
          Key: key,
          Bucket: this.options.bucket,
        },
        function (err, data) {
          if (err) {
            reject(new ObjectNotFoundError());
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
        (error, data) => {
          if (error) {
            reject(
              new PrismeError(
                "Failed to list files before deletion",
                error,
                ErrorSeverity.Fatal
              )
            );
          } else if (data && data.Contents) {
            Promise.all(
              data.Contents.map(
                ({ Key }) =>
                  new Promise((resolve, reject) => {
                    this.client.deleteObject(
                      { Key: Key as any, Bucket: this.options.bucket },
                      (err, data) => {
                        if (err) {
                          reject(
                            new PrismeError(
                              "Failed to delete file",
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
        function (err, data) {
          if (err) {
            reject(
              new PrismeError("Failed to delete file", err, ErrorSeverity.Fatal)
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
      this.client.putObject(params, function (err, data) {
        if (err) {
          reject(
            new PrismeError("Failed to save file", err, ErrorSeverity.Fatal)
          );
        } else {
          resolve(data);
        }
      });
    });
  }
}
