export type ImportProcessing = {
  processing?: boolean;
  message?: string;
};
export class ImportProcessingError extends Error {
  error: ImportProcessing;
  constructor(error: ImportProcessing) {
    super();
    this.error = error;
  }
}
export type ImportSuccess = {
  createdWorkspaceIds?: string[];
  updatedWorkspaceIds?: string[];
  imported: string[];
  errors?: {
    [name: string]: any;
  }[];
  workspace?: Prismeai.DSULReadOnly;
  publishedApps?: Prismeai.App[];
  deleted?: string[];
};
