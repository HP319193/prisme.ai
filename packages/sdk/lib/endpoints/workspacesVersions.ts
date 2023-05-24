import { Api } from '../api';

export class WorkspacesVersionsEndpoint {
  private workspaceId: string;
  private api: Api;

  constructor(workspaceId: string, api: Api) {
    this.workspaceId = workspaceId;
    this.api = api;
  }

  create(version?: PrismeaiAPI.PublishWorkspaceVersion.RequestBody) {
    this.api.post(`/workspaces/${this.workspaceId}/versions`, version);
  }
  rollback(
    versionId: PrismeaiAPI.RollbackWorkspaceVersion.PathParameters['versionId']
  ) {
    this.api.post(
      `/workspaces/${this.workspaceId}/versions/${versionId}/rollback`
    );
  }

  async export(version: PrismeaiAPI.ExportWorkspaceVersion.Parameters.VersionId = 'current') {
    const res = await this.api.prepareRequest(
      `/workspaces/${this.workspaceId}/versions/${version}/export`, {
        method: 'post'
      }
    )
    return new Blob([await res.arrayBuffer()], { type: 'application/zip' });
    
  }
}

export default WorkspacesVersionsEndpoint;
