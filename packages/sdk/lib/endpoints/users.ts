import { Api } from '../api';

export class UsersEndpoint {
  private id: string;
  private api: Api;

  constructor(id: string, api: Api) {
    this.id = id;
    this.api = api;
  }

  async setMeta(k: string, v: any) {
    await this.api.post(`/user/meta`, {
      [k]: v,
    });
  }
  async deleteMeta(k: string) {
    await this.api.delete(`/user/meta/${k}`);
  }
}

export default UsersEndpoint;
