import archiver from 'archiver';
import stream from 'stream';
import { DriverType, IStorage, ObjectList } from '../types';
import { join, dirname, basename } from 'path';
import fs, { promises as promisesFs } from 'fs';
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

async function copyDir(src: string, dest: string) {
  mkdir(dest);
  let entries = await promisesFs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = join(src, entry.name);
    let destPath = join(dest, entry.name);

    entry.isDirectory()
      ? await copyDir(srcPath, destPath)
      : await promisesFs.copyFile(srcPath, destPath);
  }
}

export default class Filesystem implements IStorage {
  private options: FilesystemOptions;

  public constructor(options: FilesystemOptions) {
    this.options = {
      ...options,
      dirpath: options.dirpath || defaultFilesystemOptions.dirpath,
    };
    mkdir(this.options.dirpath || '');
  }

  type() {
    return DriverType.FILESYSTEM;
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
        fs.rmSync(this.getPath(key), { recursive: true });
        resolve({ success: true });
      } catch (e) {
        reject(
          new PrismeError('Failed to delete file', e, ErrorSeverity.Fatal)
        );
      }
    });
  }

  async deleteMany(keys: string[]) {
    return await Promise.all(
      keys.map((key) => {
        return this.delete(key);
      })
    );
  }

  async copy(from: string, to: string, directory: boolean = false) {
    const fromFilepath = this.getPath(from);
    const toFilepath = this.getPath(to);

    const parentDirectory = dirname(toFilepath);
    mkdir(parentDirectory);

    try {
      if (directory) {
        await copyDir(fromFilepath, toFilepath);
      } else {
        await promisesFs.copyFile(fromFilepath, toFilepath);
      }
    } catch (err) {
      if (
        !directory &&
        (`${err}`.includes('ENOTSUP: operation not supported on socket') ||
          `${err}`.includes('EISDIR: illegal operation on a directory'))
      ) {
        await this.copy(from, to, true);
        return;
      }
      throw new PrismeError(
        `Failed to copy from '${fromFilepath}' to '${toFilepath}'`,
        err,
        ErrorSeverity.Fatal
      );
    }
  }

  async export(
    path: string,
    format: string = 'zip',
    outStream?: stream.Writable
  ) {
    const fullPath = this.getPath(path);

    let isDirectory;
    try {
      isDirectory = fs.lstatSync(fullPath).isDirectory();
    } catch {
      throw new ObjectNotFoundError();
    }

    const archive = archiver((format as any) || 'zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const buffers: Buffer[] = [];
    if (outStream) {
      archive.pipe(outStream);
    } else {
      archive.on('readable', function (buffer) {
        for (;;) {
          let buffer = archive.read();
          if (!buffer) {
            break;
          }
          buffers.push(buffer);
        }
      });
    }

    const completionPromise = new Promise<Buffer | 'streamed'>(
      (resolve, reject) => {
        archive.on('warning', function (err) {
          if (err.code === 'ENOENT') {
            reject(new ObjectNotFoundError());
          } else {
            reject(err);
          }
        });
        archive.on('error', function (err) {
          reject(err);
        });
        archive.on('end', () => {
          const buffer = outStream ? 'streamed' : Buffer.concat(buffers);
          resolve(buffer);
        });
      }
    );

    if (isDirectory) {
      archive.directory(fullPath, basename(fullPath));
    } else {
      archive.append(fs.createReadStream(fullPath), {
        name: basename(fullPath),
      });
    }

    archive.finalize();
    return completionPromise;
  }
}
