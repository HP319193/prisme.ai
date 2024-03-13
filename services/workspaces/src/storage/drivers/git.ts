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
import { URL } from 'url';
import { ForbiddenError } from '@prisme.ai/permissions';
import { token } from '../../utils';

export type GitOptions = FilesystemOptions &
  Prismeai.WorkspaceRepository['config'];

export type GitExportOptions = ExportOptions & {
  commit?: string; // Speciic commit to export from
};

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

    // Init authentication
    this.git = simpleGit(gitOptions)
      .clean(CleanOptions.FORCE)
      .env({ GIT_TERMINAL_PROMPT: '0' });
  }

  type() {
    return DriverType.GIT;
  }

  protected getPath(key: string) {
    return join(this.gitOptions.dirpath || '', key);
  }

  async pull(repoId: string) {
    const path = this.getPath(repoId);
    await promisesFs.mkdir(path, { recursive: true });
    await this.git.cwd(path);
    this.git.addConfig('credential.helper', 'cache --timeout=60', false);
    try {
      // This throw on 2nd exec
      await this.git.addRemote('origin', this.gitOptions.url!);
    } catch {}
    try {
      await this.git.init();

      // Password authentication
      let origin = this.gitOptions.url;
      if (
        this.gitOptions?.auth?.user &&
        this.gitOptions?.auth?.password &&
        origin.startsWith('https://')
      ) {
        const url = new URL(origin);
        url.username = this.gitOptions.auth.user;
        url.password = this.gitOptions.auth.password;
        origin = url.toString();
      }

      // SSH Key auth
      if (this.gitOptions?.auth?.sshkey) {
        const filepath = `/tmp/${token()}`;
        // Delete the key after 20 seconds
        setTimeout(() => {
          promisesFs.unlink(filepath);
        }, 20000);
        await promisesFs.writeFile(
          filepath,
          this.gitOptions?.auth?.sshkey.trim() + '\n',
          {
            mode: 0o600,
          }
        );
        this.git.addConfig(
          'core.sshCommand',
          `ssh -i ${filepath} -o IdentitiesOnly=yes`
        );
      }

      await this.git.pull(origin, this.gitOptions.branch);
      await this.git.checkout(this.gitOptions.branch);
    } catch (err) {
      throw err;
    }
  }

  async export(
    subkey: string,
    outStream?: stream.Writable,
    opts?: GitExportOptions
  ) {
    try {
      await this.pull(subkey);

      if (opts?.commit) {
        await this.git.checkout(opts?.commit);
      }

      // Write given stream to this directory
      return await super.export(subkey, outStream, opts);
    } catch (err) {
      if (opts?.commit && `${err}`.includes(opts?.commit)) {
        throw new ObjectNotFoundError(
          `Unknown commit or tag '${opts.commit}' at '${this.gitOptions.url}'`,
          {
            repository: this.gitOptions.url,
            commit: opts.commit,
          }
        );
      }
      this.handleErrors(err as Error);
      throw err;
    }
  }

  async import(subkey: string, zip: stream.Readable, opts?: ImportOptions) {
    try {
      await this.pull(subkey);

      // Write given stream to this directory
      await super.import(subkey, zip, opts);

      // Push
      await this.git
        .add('--all')
        .commit(opts?.description || `Prismeai Import`);
      await this.git.push(this.gitOptions.url!, this.gitOptions.branch);
      return true;
    } catch (err) {
      this.handleErrors(err as Error);
      throw err;
    }
  }

  private handleErrors(err: Error, opts?: any) {
    if (`${err}`.includes("couldn't find remote ref")) {
      throw new ObjectNotFoundError(
        `Unknown git branch '${this.gitOptions.branch}' at '${this.gitOptions.url}'`,
        {
          repository: this.gitOptions.url,
          branch: this.gitOptions.branch,
        }
      );
    } else if (`${err}`.includes('Could not read from remote repository')) {
      throw new ObjectNotFoundError(
        `Repository ${this.gitOptions.url} is either unreachable or unauthenticated`,
        {
          repository: this.gitOptions.url,
        }
      );
    } else if (`${err}`.includes('Authentication failed')) {
      throw new ForbiddenError(
        `Authentication failed for repository ${this.gitOptions.url}`,
        {
          repository: this.gitOptions.url,
        }
      );
    }
    throw err;
  }
}
