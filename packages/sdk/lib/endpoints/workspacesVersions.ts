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
}

export default WorkspacesVersionsEndpoint;
