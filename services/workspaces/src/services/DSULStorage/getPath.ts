import path from 'path';
import { MissingFieldError } from '../../errors';
import {
  DSULQuery,
  DSULType,
  getFolderIndexType,
  DSULRootFiles,
} from './types';

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
    dsulType = getFolderIndexType(dsulType);
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

  // Root files
  if (DSULRootFiles.includes(dsulType)) {
    return parentFolder
      ? baseVersionFolder
      : `${baseVersionFolder}/${dsulType}.yml`;
  }

  // Nested folders with slugged filenames
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
