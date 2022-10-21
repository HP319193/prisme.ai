import { Api } from '../api';

export class WorkspacesVersionsEndpoint {
  private workspaceId: string;
  private api: Api;

  constructor(workspaceId: string, api: Api) {
    this.workspaceId = workspaceId;
    this.api = api;
  }

  create(dsul: Prismeai.DSUL) {
    this.api.post(`/v2/workspaces/${this.workspaceId}/versions`, dsul);
  }
  rollback(versionId: string) {
    this.api.post(
      `/v2/workspaces/${this.workspaceId}/versions/${versionId}/rollback`
    );
  }
}

export default WorkspacesVersionsEndpoint;
