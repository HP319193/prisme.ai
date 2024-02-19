import { Api } from '../api';
import { dataURItoBlob, isDataURL } from '../utils';

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
    if (isDataURL(data.photo)) {
      await this.updatePhoto(data.photo);
      delete data.photo;
    }
    return await this.api.patch('/user', data);
  }

  async updatePhoto(
    photo: string
  ): Promise<PrismeaiAPI.PostUserPhoto.Responses.$200> {
    if (!isDataURL(photo)) {
      throw new Error('Photo must be a dataurl file');
    }
    const formData = new FormData();
    formData.append('photo', ...dataURItoBlob(photo));

    return await this.api.post<PrismeaiAPI.PostUserPhoto.Responses.$200>(
      `/user/photo`,
      formData
    );
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
