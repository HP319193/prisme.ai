export enum DSULType {
  DSULIndex = 'index',

  Security = 'security',

  PagesIndex = 'pages/__index__',
  Pages = 'pages',
  DetailedPage = 'detailedPage',

  AutomationsIndex = 'automations/__index__',
  Automations = 'automations',

  ImportsIndex = 'imports/__index__',
  Imports = 'imports',

  RuntimeModel = 'runtime',
}
// Types ending like this will be automatically updated as FolderIndex :
export const FolderIndexSuffix = '/__index__';

export type DSULQuery<t extends DSULType = any> = {
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

export type DSULInterfaces = {
  [DSULType.DSULIndex]: Prismeai.Workspace;
  [DSULType.Security]: Prismeai.WorkspaceSecurity;

  [DSULType.AutomationsIndex]: Prismeai.AutomationMeta;
  [DSULType.Automations]: Prismeai.Automation;

  [DSULType.PagesIndex]: Prismeai.PageMeta;
  [DSULType.Pages]: Prismeai.Page;
  [DSULType.DetailedPage]: Prismeai.DetailedPage;

  [DSULType.ImportsIndex]: Prismeai.AppInstanceMeta;
  [DSULType.Imports]: Prismeai.AppInstance;

  [DSULType.RuntimeModel]: Prismeai.RuntimeModel;
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

export function getFolderIndexType(dsulType: DSULType) {
  const indexType = `${dsulType}${FolderIndexSuffix}` as DSULType;
  if (Object.values(DSULType).includes(indexType)) {
    return indexType;
  }
  if (
    Object.values(DSULType).includes(dsulType) &&
    dsulType.includes(FolderIndexSuffix)
  ) {
    return dsulType;
  }
  throw new Error(
    `No folder index type configured for the DSULType ${dsulType}`
  );
}
