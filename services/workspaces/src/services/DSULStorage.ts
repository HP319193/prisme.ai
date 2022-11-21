import yaml from 'js-yaml';
import path from 'path';
import { SLUG_VALIDATION_REGEXP } from '../../config';
import {
  AlreadyUsedError,
  InvalidSlugError,
  MissingFieldError,
  ObjectNotFoundError,
} from '../errors';
import { IStorage } from '../storage/types';
import { extractEmits } from '../utils/extractEmits';

export enum DSULType {
  DSULIndex = 'index',

  PagesIndex = 'pages/__index__',
  Pages = 'pages',
  DetailedPage = 'detailedPage',

  AutomationsIndex = 'automations/__index__',
  Automations = 'automations',

  ImportsIndex = 'imports/__index__',
  Imports = 'imports',
}
// Types ending like this will be automatically updated as FolderIndex :
const FolderIndexSuffix = '/__index__';

type DSULQuery<t extends DSULType = any> = {
  workspaceId?: string;
  workspaceSlug?: string;
  appSlug?: string;
  legacy?: boolean;
  dsulType?: t;
  version?: string;
  parentFolder?: boolean;
  slug?: string;
  folderIndex?: boolean; // Automatically deduce proper dsulType given the current one
};

type DSULInterfaces = {
  [DSULType.DSULIndex]: Prismeai.Workspace;

  [DSULType.AutomationsIndex]: Prismeai.AutomationMeta;
  [DSULType.Automations]: Prismeai.Automation;

  [DSULType.PagesIndex]: Prismeai.PageMeta;
  [DSULType.Pages]: Prismeai.Page;
  [DSULType.DetailedPage]: Prismeai.DetailedPage;

  [DSULType.ImportsIndex]: Prismeai.AppInstanceMeta;
  [DSULType.Imports]: Prismeai.AppInstance;
};

export type FolderIndex = Record<
  string,
  {
    name?: Prismeai.LocalizedText;
    description?: Prismeai.LocalizedText;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    [k: string]: any;
  }
>;

export function getPath(dsulType: DSULType, opts: Partial<DSULQuery>) {
  let {
    appSlug,
    workspaceId,
    workspaceSlug,
    version,
    slug,
    parentFolder,
    legacy,
    folderIndex,
  } = opts;

  if (folderIndex && !dsulType.includes('/')) {
    const indexType = `${dsulType}${FolderIndexSuffix}` as DSULType;
    if (!Object.values(DSULType).includes(indexType)) {
      throw new Error(
        `No folder index type configured for the DSULType ${dsulType}`
      );
    }
    dsulType = indexType;
  }

  if (dsulType == DSULType.DetailedPage) {
    if (!workspaceSlug || (!parentFolder && !slug)) {
      throw new Error('Missing workspaceSlug or page slug');
    }
    const baseFolder = `pages/${workspaceSlug}`;
    return parentFolder ? baseFolder : `${baseFolder}/${slug}.yml`;
  }

  if (!workspaceId && !appSlug) {
    throw new Error('Missing workspaceId or appSlug');
  }

  const baseFolder = `${appSlug ? 'apps' : 'workspaces'}/${
    appSlug || workspaceId
  }`;
  if (parentFolder && !version && dsulType == DSULType.DSULIndex) {
    return baseFolder;
  }
  if (!version) {
    version = 'current';
  }

  if (legacy) {
    return `${baseFolder}/${version}.yml`;
  }
  const baseVersionFolder = `${baseFolder}/versions/${version}`;

  if (dsulType == DSULType.DSULIndex) {
    return parentFolder ? baseVersionFolder : `${baseVersionFolder}/index.yml`;
  }

  const isIndex = dsulType.includes('/');
  if (!parentFolder && !isIndex && !slug) {
    throw new MissingFieldError('Missing slug for ' + dsulType);
  }
  const subFolder = `${baseVersionFolder}/${dsulType}`;
  const resourceFile = isIndex
    ? `${subFolder}.yml`
    : `${subFolder}/${slug}.yml`;
  return parentFolder ? path.dirname(resourceFile) : resourceFile;
}

export default class DSULStorage<
  t extends keyof DSULInterfaces = DSULType.DSULIndex
> {
  private driver: IStorage;
  private dsulType: DSULType;
  private dsulQuery: DSULQuery;

  constructor(driver: IStorage, dsulType: t, dsulQuery: DSULQuery = {}) {
    this.dsulQuery = dsulQuery;
    this.dsulType = dsulType;
    this.driver = driver;
  }

  child<newT extends keyof DSULInterfaces>(
    dsulType: newT,
    dsulQuery: DSULQuery = {}
  ): DSULStorage<newT> {
    const child = Object.assign({}, this, {
      dsulType,
      dsulQuery: {
        ...this.dsulQuery,
        ...dsulQuery,
      },
    });
    Object.setPrototypeOf(child, DSULStorage.prototype);
    return child;
  }

  async folderIndex<t extends DSULType>(
    query: Partial<DSULQuery<t>> = {}
  ): Promise<Record<string, DSULInterfaces[t]> | false> {
    try {
      return ((await this.get(
        {
          ...query,
          folderIndex: true,
        },
        false
      )) || {}) as any as Record<string, DSULInterfaces[t]>;
    } catch (error) {
      return false; // No folderIndex for this type
    }
  }

  prepareIndexEntry<dsulType extends keyof DSULInterfaces>(
    dsulType: dsulType,
    dsul: DSULInterfaces[dsulType]
  ): DSULInterfaces[dsulType] {
    if (dsulType == DSULType.Automations) {
      const automation = dsul as DSULInterfaces[DSULType.Automations];
      const indexEntry: Prismeai.AutomationMeta = {
        name: (dsul as any).name,
        description: (dsul as any).description,
        arguments: automation.arguments,
        private: automation.private,
        disabled: automation.disabled,
        when: automation.when,
        emits: extractEmits(automation).map(({ event, autocomplete }) => ({
          event,
          autocomplete,
        })),
      };
      return indexEntry as DSULInterfaces[dsulType];
    } else if (dsulType == DSULType.Imports) {
      const appInstance = dsul as DSULInterfaces[DSULType.Imports];
      const indexEntry: Prismeai.AppInstanceMeta = {
        appSlug: appInstance.appSlug,
        appName: appInstance.appName,
        appVersion: appInstance.appVersion,
        disabled: appInstance.disabled,
      };
      return indexEntry as DSULInterfaces[dsulType];
    }
    if (dsulType == DSULType.Pages) {
      const page = dsul as DSULInterfaces[DSULType.Pages];
      const indexEntry: Prismeai.PageMeta = {
        name: page.name!,
        description: page.description,
        id: page.id,
        blocks: (page.blocks || []).map(({ slug, appInstance }) => ({
          slug,
          appInstance,
        })),
      };
      return indexEntry as DSULInterfaces[dsulType];
    } else {
      return {
        name:
          typeof (dsul as any).name == 'object'
            ? Object.values((dsul as any).name)[0]
            : (dsul as any).name,
        description: (dsul as any).description,
      } as DSULInterfaces[dsulType];
    }
  }

  getPath(opts: Partial<DSULQuery>) {
    return getPath(opts.dsulType || this.dsulType, {
      ...this.dsulQuery,
      ...opts,
    });
  }

  async get<overrideT extends keyof DSULInterfaces = t>(
    query: DSULQuery<overrideT>,
    throwIfNotFound: boolean = true
  ): Promise<DSULInterfaces[overrideT]> {
    const path = this.getPath(query);
    try {
      const dsul = await this.driver.get(path);
      return yaml.load(dsul) as DSULInterfaces[overrideT];
    } catch {
      if (throwIfNotFound) {
        throw new ObjectNotFoundError(
          `Could not find DSUL object '${this.dsulType}' '${
            (query as any).slug ||
            (query as any).workspaceId ||
            (query as any).appSlug
          }'`,
          { type: this.dsulType, query: { ...this.dsulQuery, ...query } }
        );
      }
      return undefined as any;
    }
  }

  async save<overrideT extends DSULType = t>(
    query: DSULQuery<overrideT>,
    dsul: DSULInterfaces[overrideT],
    updateIndex?: { mode?: 'create' | 'update' | 'replace'; updatedBy?: string }
  ) {
    let folderIndex = await this.folderIndex(query);
    // Check for name conflict
    if (folderIndex !== false) {
      if (!updateIndex) {
        throw new Error(`Missing updateIndex param`);
      }
      const slug = query.slug!;
      if (!SLUG_VALIDATION_REGEXP.test(slug)) {
        throw new InvalidSlugError(slug);
      }
      if (!slug) {
        throw new MissingFieldError(
          `Missing slug in order to save given ${this.dsulType}`
        );
      }

      const oldSlugBeforeRename =
        updateIndex?.mode == 'update' && dsul?.slug && slug !== dsul?.slug
          ? slug
          : '';

      if (
        (updateIndex?.mode == 'create' && slug in folderIndex) ||
        (oldSlugBeforeRename && (<any>dsul)?.slug in folderIndex)
      ) {
        throw new AlreadyUsedError(
          `${this.dsulType} slug ${
            oldSlugBeforeRename ? dsul?.slug : slug
          } already exists`
        );
      } else if (updateIndex?.mode == 'update' && !(slug in folderIndex)) {
        throw new ObjectNotFoundError(
          `Could not find DSUL object '${this.dsulType}' '${slug}'`,
          { type: this.dsulType, query }
        );
      }

      (query as any).slug = oldSlugBeforeRename ? dsul?.slug! : slug;
      // Update folderIndex
      const updatedAt = new Date().toISOString();
      folderIndex[(query as any).slug] = {
        ...this.prepareIndexEntry<overrideT>(
          (query.dsulType || this.dsulType) as any,
          dsul
        ),
        createdAt:
          (folderIndex[oldSlugBeforeRename || (query as any).slug] as any)
            ?.createdAt || updatedAt,
        createdBy:
          (folderIndex[oldSlugBeforeRename || (query as any).slug] as any)
            ?.createdBy || updateIndex?.updatedBy!,
        updatedAt,
        updatedBy: updateIndex?.updatedBy!,
      };

      // Renaming : delete old file
      if (oldSlugBeforeRename) {
        delete folderIndex[oldSlugBeforeRename];
        await this.delete({
          ...query,
          slug: oldSlugBeforeRename,
        });
      }
    }

    await this.driver.save(
      this.getPath(query),
      yaml.dump(dsul, { skipInvalid: true })
    );
    // Maintain subfolders index up-to-date
    if (folderIndex) {
      await this.driver.save(
        this.getPath({ ...query, folderIndex: true }),
        yaml.dump(folderIndex, { skipInvalid: true })
      );
    }
  }

  async delete(query: DSULQuery) {
    try {
      await this.driver.delete(this.getPath(query));
    } catch {
      throw new ObjectNotFoundError(
        `Could not find DSUL object '${this.dsulType}' '${
          (query as any).slug ||
          (query as any).workspaceId ||
          (query as any).appId
        }'`,
        { type: this.dsulType, query: { ...this.dsulQuery, ...query } }
      );
    }

    let folderIndex = await this.folderIndex(query);
    if (folderIndex !== false) {
      delete folderIndex[(query as any).slug || ''];
    }

    // Maintain subfolders index up-to-date
    if (folderIndex) {
      await this.driver.save(
        this.getPath({ ...query, folderIndex: true }),
        yaml.dump(folderIndex, { skipInvalid: true })
      );
    }
  }

  async copy(fromQuery: DSULQuery, toQuery: DSULQuery) {
    await this.driver.copy(this.getPath(fromQuery), this.getPath(toQuery));
  }
}
