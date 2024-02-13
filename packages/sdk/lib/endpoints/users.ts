import { Api } from '../api';

export class UsersEndpoint {
  private id: string;
  private api: Api;

  constructor(id: string, api: Api) {
    this.id = id;
    this.api = api;
  }

  async update(
    data: Partial<Prismeai.User>
  ): Promise<PrismeaiAPI.PatchUser.Responses.$200> {
    if (!data.photo) {
      delete data.photo;
    }
    return await this.api.patch('/user', data);
  }

  async setMeta(
    k: string,
    v: any
  ): Promise<PrismeaiAPI.SetMeta.Responses.$200> {
    return await this.api.post(`/user/meta`, {
      [k]: v,
    });
  }
  async deleteMeta(k: string): Promise<PrismeaiAPI.DeleteMeta.Responses.$200> {
    return await this.api.delete(`/user/meta/${k}`);
  }
}

export default UsersEndpoint;
