import { IStorage } from "../types";
import { join, dirname } from "path";
import fs from "fs";
import { ErrorSeverity, PrismeError } from "../../errors";

export interface FilesystemOptions {
  dirpath?: string;
}

const defaultFilesystemOptions: Partial<FilesystemOptions> = {
  dirpath: join(__dirname, "app_models"),
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
    mkdir(this.options.dirpath || "");
  }

  private getPath(key: string) {
    return join(this.options.dirpath || "", key);
  }

  public get(key: string) {
    return new Promise((resolve: any, reject: any) => {
      fs.readFile(this.getPath(key), (err, data) => {
        if (err) {
          throw new PrismeError(
            "Failed to retrieve file",
            err,
            ErrorSeverity.Error
          );
        }
        resolve(data);
      });
    });
  }

  public save(key: string, data: any) {
    const filepath = this.getPath(key);
    const parentDirectory = dirname(filepath);
    mkdir(parentDirectory);
    return new Promise((resolve: any, reject: any) => {
      fs.writeFile(filepath, data, (err) => {
        if (err) {
          throw new PrismeError(
            "Failed to save file",
            err,
            ErrorSeverity.Error
          );
        }
        resolve({ success: true });
      });
    });
  }

  public delete(key: string) {
    return new Promise((resolve: any, reject: any) => {
      try {
        //@ts-ignore l'option recursive apparu avec node12 n'est visiblement pas encore typée !
        fs.rmdirSync(this.getPath(key), { recursive: true });
        resolve({ success: true });
      } catch (e) {
        throw new PrismeError("Failed to delete file", e, ErrorSeverity.Error);
      }
    });
  }
}
