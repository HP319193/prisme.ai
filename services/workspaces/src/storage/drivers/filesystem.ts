import archiver from 'archiver';
import stream from 'stream';
import unzipper from 'unzipper';
import {
  DriverType,
  ExportOptions,
  GetOptions,
  IStorage,
  ImportOptions,
  ObjectList,
  SaveOptions,
  Streamed,
} from '../types';
import { join, dirname, basename } from 'path';
import fs, { createReadStream, promises as promisesFs } from 'fs';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';
import { streamToBuffer } from '../../utils/streamToBuffer';

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

  protected getPath(key: string) {
    return join(this.options.dirpath || '', key);
  }

  async get(key: string, opts?: GetOptions) {
    const path = this.getPath(key);
    return await new Promise((resolve: any, reject: any) => {
      if (opts?.stream) {
        const stream = createReadStream(path);
        stream.pipe(opts.stream);
        stream.on('end', () => {
          resolve(Streamed);
        });
        stream.on('error', () => {
          reject(new ObjectNotFoundError());
        });
        return;
      }

      fs.readFile(path, (err, data) => {
        if (err) {
          reject(new ObjectNotFoundError());
        }
        resolve(data);
      });
    });
  }

  async find(path: string): Promise<ObjectList> {
    const fullpath = this.getPath(path);
    const dirents = await promisesFs.readdir(fullpath, {
      withFileTypes: true,
    });
    const paths = await Promise.all(
      dirents.map((dirent) => {
        if (dirent.name === '.git') {
          return false;
        }
        return dirent.isDirectory()
          ? this.find(join(path, dirent.name)).then((keys) =>
              keys.map(({ key }) => ({ key: join(dirent.name, key) }))
            )
          : { key: dirent.name };
      })
    );
    return paths.flat().filter<{ key: string }>(Boolean as any);
  }

  async save(key: string, data: any, opts?: SaveOptions) {
    // Ignore irrelevant ACL options (specific to cloud provider object storages)
    if (data === undefined && typeof opts?.public !== 'undefined') {
      return;
    }
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
    outStream?: stream.Writable,
    opts?: ExportOptions
  ) {
    const { format } = opts || {};
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

    let completionPromise: Promise<typeof Streamed | Buffer>;
    if (outStream) {
      archive.pipe(outStream);
      completionPromise = Promise.resolve(Streamed);
    } else {
      completionPromise = streamToBuffer(archive);
    }

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

  async import(subkey: string, zip: stream.Readable, opts?: ImportOptions) {
    if (opts?.archive === false) {
      throw new PrismeError(
        `Storage import currently only supports archive input`,
        {}
      );
    }
    try {
      // Prepare & pull local repository
      const path = this.getPath(subkey);

      // Write given stream to this directory
      const zipParser = unzipper.Parse({ forceStream: true });
      zip.pipe(zipParser);
      const archiveFiles = new Set();
      for await (const entry of zipParser) {
        let filepath = entry.path;
        if (opts?.fileCallback) {
          const result = opts.fileCallback(filepath, entry);
          if (!result) {
            entry.autodrain();
            continue;
          }
          if (result.filepath) {
            filepath = result.filepath;
          }
        }

        if (entry.type === 'File') {
          archiveFiles.add(filepath);
          await promisesFs.mkdir(join(path, dirname(filepath)), {
            recursive: true,
          });
          entry.pipe(fs.createWriteStream(join(path, filepath)));
        } else {
          entry.autodrain();
        }
      }

      if (opts.removeAdditionalFiles) {
        const currentFiles = await this.find(subkey);
        const additionalFiles = currentFiles.filter(
          ({ key }) => !archiveFiles.has(key)
        );
        if (additionalFiles?.length) {
          await this.deleteMany(
            additionalFiles.map(({ key }) => join(subkey, key))
          );
        }
      }

      // Push
      return true;
    } catch (err) {
      throw err;
    }
  }
}
