import yaml from 'js-yaml';
import { SLUG_VALIDATION_REGEXP } from '../../../config';
import {
  AlreadyUsedError,
  InvalidSlugError,
  MissingFieldError,
  ObjectNotFoundError,
} from '../../errors';
import { logger } from '../../logger';
import { IStorage } from '../../storage/types';
import { getPath } from './getPath';
import {
  DSULInterfaces,
  DSULQuery,
  DSULType,
  FolderIndex,
  FolderIndexSuffix,
  getFolderIndexType,
} from './types';

export class DSULStorage<t extends keyof DSULInterfaces = DSULType.DSULIndex> {
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
      getFolderIndexType(query.dsulType || this.dsulType);
    } catch {
      return false; // No folderIndex for this type
    }
    try {
      return ((await this.get(
        {
          ...query,
          folderIndex: true,
        },
        false
      )) || {}) as any as Record<string, DSULInterfaces[t]>;
    } catch {
      return {}; // Uninitialized folderIndex
    }
  }

  async refreshFolderIndex<t extends DSULType>(
    workspaceId: string,
    dsulType: t
  ) {
    getFolderIndexType(dsulType);

    const files = await this.driver.find(
      this.getPath({
        workspaceId,
        dsulType,
        parentFolder: true,
      })
    );

    const slugs = files
      .map(({ key }) =>
        !key || `/${key}`.startsWith(FolderIndexSuffix) || !key.endsWith('.yml')
          ? false
          : key.slice(0, -4)
      )
      .filter<string>(Boolean as any);

    const dsuls = await Promise.all(
      slugs.map((slug) =>
        this.get(
          {
            workspaceId,
            dsulType,
            slug,
          },
          false
        )
      )
    );

    const folderIndex: FolderIndex = dsuls.reduce<FolderIndex>(
      (folderIndex, dsul, idx) =>
        !dsul
          ? folderIndex
          : {
              ...folderIndex,
              [slugs[idx]]: this.prepareIndexEntry(
                dsulType,
                dsul as any
              ) as any,
            },
      {}
    );

    await this.driver.save(
      this.getPath({ workspaceId, dsulType, folderIndex: true }),
      yaml.dump(folderIndex, { skipInvalid: true })
    );
  }

  prepareIndexEntry<dsulType extends keyof DSULInterfaces>(
    dsulType: dsulType,
    dsul: DSULInterfaces[dsulType],
    additionalIndexFields?: Record<string, any>
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
        labels: automation.labels,
        ...additionalIndexFields,
      };
      return indexEntry as DSULInterfaces[dsulType];
    } else if (dsulType == DSULType.Imports) {
      const appInstance = dsul as DSULInterfaces[DSULType.Imports];
      const indexEntry: Prismeai.AppInstanceMeta = {
        appSlug: appInstance.appSlug,
        appName: appInstance.appName,
        appVersion: appInstance.appVersion,
        disabled: appInstance.disabled,
        labels: appInstance.labels,
        ...additionalIndexFields,
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
        labels: page.labels,
        ...additionalIndexFields,
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
          `Could not find DSUL object '${query.dsulType || this.dsulType}' '${
            (query as any).slug ||
            (query as any).workspaceId ||
            (query as any).appSlug
          }'`,
          {
            type: query.dsulType || this.dsulType,
            query: { ...this.dsulQuery, ...query },
          }
        );
      }
      return undefined as any;
    }
  }

  async patch<overrideT extends DSULType = t>(
    query: DSULQuery<overrideT>,
    dsulPatch: Partial<DSULInterfaces[overrideT]>,
    updateIndex?: {
      mode?: 'create' | 'update' | 'replace';
      updatedBy?: string;
    }
  ) {
    const currentDSUL = await this.get(query);
    const newDSUL = {
      ...currentDSUL,
      ...dsulPatch,
    };
    return await this.save(query, newDSUL, updateIndex);
  }

  async save<overrideT extends DSULType = t>(
    query: DSULQuery<overrideT>,
    dsul: DSULInterfaces[overrideT],
    updateIndex?: {
      mode?: 'create' | 'update' | 'replace';
      updatedBy?: string;
      additionalIndexFields?: Record<string, any>;
    }
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
          dsul,
          updateIndex?.additionalIndexFields
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
      this.driver
        .save(
          this.getPath({ ...query, folderIndex: true }),
          yaml.dump(folderIndex, { skipInvalid: true })
        )
        .catch((err) => {
          logger.warn({
            msg: 'Could not write DSUL folder index file',
            err,
          });
        });
    }
  }

  async delete(query: DSULQuery) {
    let folderIndex = await this.folderIndex(query);

    try {
      await this.driver.delete(this.getPath(query));

      if (folderIndex !== false) {
        const slug = (query as any).slug || '';
        if (!(slug in folderIndex)) {
          throw new ObjectNotFoundError();
        }
        delete folderIndex[slug];
      }
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
