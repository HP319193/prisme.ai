import { Api } from '../api';
import { Fetched } from '../fetcher';
import { dataURItoBlob, removedUndefinedProperties } from '../utils';
import WorkspacesVersionsEndpoint from './workspacesVersions';

export class WorkspacesEndpoint {
  private id: string;
  private api: Api;

  constructor(id: string, api: Api) {
    this.id = id;
    this.api = api;
  }

  get versions() {
    return new WorkspacesVersionsEndpoint(this.id, this.api);
  }

  async update(
    workspace: Prismeai.DSULPatch
  ): Promise<Fetched<PrismeaiAPI.UpdateWorkspace.Responses.$200> | null> {
    return await this.api.patch(
      `/workspaces/${this.id}`,
      await this.api.replaceAllImagesData(workspace, this.id)
    );
  }

  async delete(): Promise<PrismeaiAPI.DeleteWorkspace.Responses.$200> {
    return await this.api.delete(`/workspaces/${this.id}`);
  }

  async uploadFiles(
    files: string | string[],
    opts?: {
      expiresAfter?: number;
      public?: boolean;
      shareToken?: boolean;
    }
  ) {
    const formData = new FormData();
    (Array.isArray(files) ? files : [files]).forEach((file) => {
      try {
        formData.append('file', ...dataURItoBlob(file));
      } catch {}
    });
    if (opts?.expiresAfter) {
      formData.append('expiresAfter', `${opts?.expiresAfter}`);
    }
    if (typeof opts?.public === 'boolean') {
      formData.append('public', `${opts?.public}`);
    }
    if (typeof opts?.shareToken === 'boolean') {
      formData.append('shareToken', `${opts?.shareToken}`);
    }
    try {
      // @ts-ignore
      return await this.api._fetch<PrismeaiAPI.UploadFile.Responses.$200>(
        `/workspaces/${this.id}/files`,
        {
          method: 'POST',
          body: formData,
        }
      );
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  async listAppInstances(): Promise<
    Fetched<PrismeaiAPI.ListAppInstances.Responses.$200>
  > {
    return await this.api.get(`/workspaces/${this.id}/apps`);
  }

  async getUsage({
    afterDate,
    beforeDate,
    details,
  }: {
    afterDate?: PrismeaiAPI.WorkspaceUsage.Parameters.AfterDate;
    beforeDate?: PrismeaiAPI.WorkspaceUsage.Parameters.BeforeDate;
    details?: PrismeaiAPI.WorkspaceUsage.Parameters.Details;
  } = {}): Promise<Fetched<PrismeaiAPI.WorkspaceUsage.Responses.$200>> {
    const params = new URLSearchParams(
      removedUndefinedProperties(
        {
          afterDate: `${afterDate || ''}`,
          beforeDate: `${beforeDate || ''}`,
          details: `${details || ''}`,
        },
        true
      )
    );

    return this.api.get(`/workspaces/${this.id}/usage?${params.toString()}`);
  }
}

export default WorkspacesEndpoint;
