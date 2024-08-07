import stream from 'stream';
import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';
import { DriverType, ExportOptions, ImportOptions } from '../types';
import { join } from 'path';
import Filesystem, { FilesystemOptions } from './filesystem';
import { promises as promisesFs } from 'fs';
import {
  AlreadyUsedError,
  ObjectNotFoundError,
  PrismeError,
} from '../../errors';
import { URL } from 'url';
import { ForbiddenError } from '@prisme.ai/permissions';
import { token } from '../../utils';

export type GitOptions = FilesystemOptions &
  Prismeai.WorkspaceRepository['config'];

export type GitExportOptions = ExportOptions & {
  commit?: string; // Speciific commit to export from
  email?: string; // Author email
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
    this.git = simpleGit();
  }

  type() {
    return DriverType.GIT;
  }

  protected getPath(key: string) {
    return join(this.gitOptions.dirpath || '', key);
  }

  private async initGit(repoId: string) {
    const path = this.getPath(repoId);
    await promisesFs.mkdir(path, { recursive: true });
    const gitOptions: Partial<SimpleGitOptions> = {
      baseDir: path,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };

    this.git = simpleGit(gitOptions).env({ GIT_TERMINAL_PROMPT: '0' });
    await this.git.init();

    // This block will throw on 2nd execution if local directory still exists
    try {
      await this.git.addRemote('origin', this.gitOptions.url!);
      await this.git.checkout(['-b', this.gitOptions.branch]);
      await this.git.branch([
        '-u',
        `origin/${this.gitOptions.branch}`,
        this.gitOptions.branch,
      ]);
    } catch (err) {
      // Always keep url updated as a change of auth method to ssh won't work if current origin url starts with https:// instead of git@
      await this.git.remote(['set-url', 'origin', this.gitOptions.url]);
    }
  }

  async pull(repoId: string) {
    await this.initGit(repoId);
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
        `ssh -i ${filepath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`
      );
    }

    await this.git.pull(origin, this.gitOptions.branch);
    await this.git.checkout(this.gitOptions.branch);

    return {
      authenticatedOrigin: origin,
    };
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
      // This origin might include password & must not be logged or transmitted
      const { authenticatedOrigin } = await this.pull(subkey);

      this.git.addConfig('user.email', opts?.meta?.email || 'hello@prisme.ai');
      if (opts?.meta?.username) {
        this.git.addConfig('user.name', opts.meta.username);
      }

      // Write given stream to this directory
      await super.import(subkey, zip, opts);

      // Push
      await this.git
        .add('--all')
        .commit(opts?.meta?.description || `Prismeai Import`);
      await this.git.push(authenticatedOrigin, this.gitOptions.branch);

      // Push tags
      if (opts?.meta?.versionId) {
        await this.git
          .addTag(opts?.meta?.versionId)
          .pushTags(authenticatedOrigin);
      }
      return true;
    } catch (err) {
      if (
        opts?.meta?.versionId &&
        (`${err}`.includes(
          `fatal: tag '${opts?.meta?.versionId}' already exists`
        ) ||
          `${err}`.includes(`tag already exists`))
      ) {
        throw new AlreadyUsedError(
          `Given version tag '${opts?.meta?.versionId}' already exists at '${this.gitOptions.url}'`,
          {
            repository: this.gitOptions.url,
            branch: this.gitOptions.branch,
            tag: opts.meta?.versionId,
          }
        );
      }
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
    } else if (`${err}`.includes('could not read Username')) {
      throw new ForbiddenError(
        `Authentication failed for repository ${this.gitOptions.url} : missing username or token`,
        {
          repository: this.gitOptions.url,
        }
      );
    }
    throw err;
  }
}
