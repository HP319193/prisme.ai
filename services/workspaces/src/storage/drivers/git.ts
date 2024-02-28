import stream from 'stream';
import {
  simpleGit,
  SimpleGit,
  SimpleGitOptions,
  CleanOptions,
} from 'simple-git';
import { DriverType, ExportOptions, ImportOptions } from '../types';
import { join } from 'path';
import Filesystem, { FilesystemOptions } from './filesystem';
import { promises as promisesFs } from 'fs';
import { ObjectNotFoundError, PrismeError } from '../../errors';

export type GitOptions = FilesystemOptions &
  Prismeai.WorkspaceRepository['config'];

export default class Git extends Filesystem {
  private git: SimpleGit;
  private gitOptions: Required<GitOptions>;

  public constructor(options: GitOptions) {
    super(options);

    if (!options.dirpath || !options.url || !options.branch) {
      throw new PrismeError(
        'Misconfigured git repository : Missing dirpath, url or branch',
        {
          dirpath: options.dirpath,
          url: options.url,
          branch: options.branch,
        }
      );
    }
    this.gitOptions = options as Required<GitOptions>;
    const gitOptions: Partial<SimpleGitOptions> = {
      baseDir: options.dirpath,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };

    // when setting all options in a single object
    this.git = simpleGit(gitOptions).clean(CleanOptions.FORCE);
  }

  type() {
    return DriverType.GIT;
  }

  protected getPath(key: string) {
    return join(this.gitOptions.dirpath || '', key);
  }

  async export(
    subkey: string,
    outStream?: stream.Writable,
    opts?: ExportOptions
  ) {
    try {
      // Prepare & pull local repository
      const path = this.getPath(subkey);
      await promisesFs.mkdir(path, { recursive: true });
      await this.git.cwd(path);
      await this.git.init();
      await this.git.pull(this.gitOptions.url!, this.gitOptions.branch);

      // Write given stream to this directory
      return await super.export(subkey, outStream, opts);
    } catch (err) {
      if (`${err}`.includes("couldn't find remote ref")) {
        throw new ObjectNotFoundError(
          `Unknown git branch '${this.gitOptions.branch}' at '${this.gitOptions.url}'`,
          {
            repository: this.gitOptions.url,
            branch: this.gitOptions.branch,
          }
        );
      }
      throw err;
    }
  }

  async import(subkey: string, zip: stream.Readable, opts?: ImportOptions) {
    try {
      // Prepare & pull local repository
      const path = this.getPath(subkey);
      await promisesFs.mkdir(path, { recursive: true });
      await this.git.cwd(path);
      try {
        // This throw on 2nd exec
        await this.git.addRemote('origin', this.gitOptions.url!);
      } catch {}
      await this.git.init();
      await this.git.pull(this.gitOptions.url!, this.gitOptions.branch);

      // Write given stream to this directory
      await super.import(subkey, zip, opts);

      // Push
      await this.git
        .add('--all')
        .commit(opts?.description || `Prismeai Import`);
      await this.git.push(this.gitOptions.url!, this.gitOptions.branch);
      return true;
    } catch (err) {
      if (`${err}`.includes("couldn't find remote ref")) {
        throw new ObjectNotFoundError(
          `Unknown git branch '${this.gitOptions.branch}' at '${this.gitOptions.url}'`,
          {
            repository: this.gitOptions.url,
            branch: this.gitOptions.branch,
          }
        );
      }
      throw err;
    }
  }
}
