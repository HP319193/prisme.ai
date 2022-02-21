import { IStorage, ObjectList } from '../types';
import { join, dirname } from 'path';
import fs from 'fs';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';

export interface FilesystemOptions {
  dirpath?: string;
}

const defaultFilesystemOptions: Partial<FilesystemOptions> = {
  dirpath: join(__dirname, '../../../models'),
};

const mkdir = (path: string, recursive: boolean = true) => {
  fs.mkdirSync(path, { recursive });
};

export default class Filesystem implements IStorage {
  private options: FilesystemOptions;

  public constructor(options: FilesystemOptions) {
    this.options = {
      ...options,
      dirpath: options.dirpath || defaultFilesystemOptions.dirpath,
    };
    mkdir(this.options.dirpath || '');
  }

  private getPath(key: string) {
    return join(this.options.dirpath || '', key);
  }

  async get(key: string) {
    return await new Promise((resolve: any, reject: any) => {
      fs.readFile(this.getPath(key), (err, data) => {
        if (err) {
          reject(new ObjectNotFoundError());
        }
        resolve(data);
      });
    });
  }

  async find(path: string): Promise<ObjectList> {
    const fullpath = this.getPath(path);
    return new Promise((resolve, reject) => {
      fs.readdir(fullpath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            files.map((path) => ({
              key: path,
            }))
          );
        }
      });
    });
  }

  async save(key: string, data: any) {
    const filepath = this.getPath(key);
    const parentDirectory = dirname(filepath);
    mkdir(parentDirectory);
    return await new Promise((resolve: any, reject: any) => {
      fs.writeFile(filepath, data, (err) => {
        if (err) {
          reject(
            new PrismeError('Failed to save file', err, ErrorSeverity.Fatal)
          );
        }
        resolve({ success: true });
      });
    });
  }

  async delete(key: string) {
    return await new Promise((resolve: any, reject: any) => {
      try {
        //@ts-ignore l'option recursive apparu avec node12 n'est visiblement pas encore typée !
        fs.rmdirSync(this.getPath(key), { recursive: true });
        resolve({ success: true });
      } catch (e) {
        reject(
          new PrismeError('Failed to delete file', e, ErrorSeverity.Fatal)
        );
      }
    });
  }
}
