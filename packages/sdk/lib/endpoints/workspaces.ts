import { Api } from '../api';
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
}

export default WorkspacesEndpoint;
