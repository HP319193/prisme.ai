import QueryString from 'qs';
import Fetcher from './fetcher';
import { Event, Workspace } from './types';
import { Events } from './events';
import { removedUndefinedProperties } from './utils';

type UserPermissions = Prismeai.UserPermissions;

interface PageWithMetadata extends Prismeai.Page {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export class Api extends Fetcher {
  async me() {
    return await this.get('/me');
  }

  async signin(
    email: string,
    password: string
  ): Promise<
    Prismeai.User & {
      token: string;
    }
  > {
    return await this.post('/login', {
      email,
      password,
    });
  }

  async createAnonymousSession(): Promise<
    Prismeai.User & {
      token: string;
    }
  > {
    return await this.post('/login/anonymous');
  }

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<
    Prismeai.User & {
      token: string;
    }
  > {
    return await this.post('/signup', {
      email: email,
      password,
      firstName,
      lastName,
    });
  }

  async signout() {
    await this.post('/logout');
    this.token = null;
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return await this.get('/workspaces?limit=300');
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return await this.get(`/workspaces/${id}`);
  }

  async createWorkspace(name: string): Promise<Workspace> {
    return await this.post('/workspaces', { name });
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return await this.patch(
      `/workspaces/${workspace.id}`,
      await this.replaceAllImagesData(workspace, workspace.id)
    );
  }

  async deleteWorkspace(workspaceId: Workspace['id']): Promise<Workspace> {
    return await this.delete(`/workspaces/${workspaceId}`);
  }

  // Automations
  async createAutomation(
    workspace: Workspace,
    automation: Prismeai.Automation
  ): Promise<Prismeai.Automation & { slug: string }> {
    return await this.post(`/workspaces/${workspace.id}/automations`, {
      ...automation,
    });
  }

  async updateAutomation(
    workspace: Workspace,
    slug: string,
    automation: Prismeai.Automation
  ): Promise<Prismeai.Automation & { slug: string }> {
    return await this.patch(
      `/workspaces/${workspace.id}/automations/${slug}`,
      await this.replaceAllImagesData(automation, workspace.id)
    );
  }

  async deleteAutomation(workspace: Workspace, slug: string): Promise<string> {
    return await this.delete(`/workspaces/${workspace.id}/automations/${slug}`);
  }

  // Pages
  async getPages(
    workspaceId: NonNullable<Workspace['id']>
  ): Promise<Prismeai.Page[]> {
    try {
      const pages = await this.get<PageWithMetadata[]>(
        `/workspaces/${workspaceId}/pages`
      );
      return pages.map(
        ({ createdAt, createdBy, updatedAt, updatedBy, ...page }: any) => page
      );
    } catch (e) {
      return [];
    }
  }

  async getPage(
    workspaceId: PrismeaiAPI.GetPage.Parameters.WorkspaceId,
    pageId: PrismeaiAPI.GetPage.Parameters.Id
  ): Promise<Prismeai.DetailedPage> {
    return await this.get(`/workspaces/${workspaceId}/pages/${pageId}`);
  }

  async getPageBySlug(
    pageSlug: PrismeaiAPI.GetPageBySlug.Parameters.Slug
  ): Promise<Prismeai.DetailedPage> {
    return await this.get(`/pages/${pageSlug}`);
  }

  async createPage(
    workspaceId: NonNullable<Workspace['id']>,
    page: Prismeai.Page
  ): Promise<Prismeai.Page> {
    const {
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      ...newPage
    } = await this.post<PageWithMetadata>(
      `/workspaces/${workspaceId}/pages`,
      page
    );
    return newPage;
  }

  // Replace images as dataurl to uploaded url in any type of data

  async updatePage(
    workspaceId: NonNullable<Workspace['id']>,
    page: Prismeai.Page
  ): Promise<Prismeai.Page> {
    const {
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      ...updatedPage
    } = await this.patch<PageWithMetadata>(
      `/workspaces/${workspaceId}/pages/${page.id}`,
      await this.replaceAllImagesData(page, workspaceId)
    );
    return updatedPage;
  }

  async deletePage(
    workspaceId: NonNullable<Workspace['id']>,
    pageId: string
  ): Promise<Pick<Prismeai.Page, 'id'>> {
    return await this.delete(`/workspaces/${workspaceId}/pages/${pageId}`);
  }

  // Events
  streamEvents(workspaceId: string, userId?: string): Promise<Events> {
    const events = new Events({
      workspaceId,
      token: this.token || '',
      apiHost: this.host,
      userId,
    });
    return new Promise((resolve, reject) => {
      events.once('connect', () => {
        resolve(events);
      });
      events.once('connect_error', () => {
        reject();
        events.close();
      });
    });
  }

  async getEvents(
    workspaceId: string,
    options: { beforeDate?: Date | string } = {}
  ): Promise<Event<Date>[]> {
    try {
      const query = QueryString.stringify(options);
      const {
        result: { events },
      } = await this.get<{
        result: {
          events: Event<string>[];
        };
      }>(`/workspaces/${workspaceId}/events${query && `?${query}`}`);
      return events.map(({ createdAt, ...event }) => ({
        ...event,
        createdAt: new Date(createdAt),
      }));
    } catch (e) {
      return [];
    }
  }

  async postEvents(
    workspaceId: PrismeaiAPI.SendWorkspaceEvent.Parameters.WorkspaceId,
    events: PrismeaiAPI.SendWorkspaceEvent.RequestBody['events']
  ): Promise<boolean> {
    try {
      await this.post<PrismeaiAPI.SendWorkspaceEvent.Responses.$200>(
        `/workspaces/${workspaceId}/events`,
        {
          events,
        }
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async getPermissions(
    subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType,
    subjectId: string
  ): Promise<PrismeaiAPI.GetPermissions.Responses.$200> {
    return await this.get(`/${subjectType}/${subjectId}/permissions`);
  }

  async addPermissions(
    subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType,
    subjectId: string,
    permissions: UserPermissions
  ): Promise<PrismeaiAPI.Share.Responses.$200> {
    return await this.post(
      `/${subjectType}/${subjectId}/permissions`,
      permissions
    );
  }

  async deletePermissions(
    subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType,
    subjectId: string,
    userEmail: string
  ): Promise<PrismeaiAPI.RevokePermissions.Responses.$200> {
    return await this.delete(
      `/${subjectType}/${subjectId}/permissions/${userEmail}`
    );
  }

  async getApps({
    query,
    page,
    limit,
    workspaceId,
  }: {
    query?: PrismeaiAPI.SearchApps.QueryParameters['text'];
    page?: PrismeaiAPI.SearchApps.QueryParameters['page'];
    limit?: PrismeaiAPI.SearchApps.QueryParameters['limit'];
    workspaceId?: PrismeaiAPI.SearchApps.QueryParameters['workspaceId'];
  }): Promise<PrismeaiAPI.SearchApps.Responses.$200> {
    const params = new URLSearchParams(
      removedUndefinedProperties(
        {
          text: `${query || ''}`,
          page: `${page || ''}`,
          limit: `${limit || ''}`,
          workspaceId: `${workspaceId || ''}`,
        },
        true
      )
    );
    return await this.get(`/apps?${params.toString()}`);
  }

  async installApp(
    workspaceId: PrismeaiAPI.InstallAppInstance.PathParameters['workspaceId'],
    body: PrismeaiAPI.InstallAppInstance.RequestBody
  ): Promise<PrismeaiAPI.InstallAppInstance.Responses.$200> {
    return await this.post(`/workspaces/${workspaceId}/apps`, body);
  }

  async updateApp(
    workspaceId: PrismeaiAPI.ConfigureAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.ConfigureAppInstance.PathParameters['slug'],
    body: PrismeaiAPI.ConfigureAppInstance.RequestBody
  ): Promise<PrismeaiAPI.ConfigureAppInstance.Responses.$200> {
    return await this.patch(`/workspaces/${workspaceId}/apps/${slug}`, body);
  }

  async uninstallApp(
    workspaceId: PrismeaiAPI.UninstallAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.ConfigureAppInstance.PathParameters['slug']
  ): Promise<PrismeaiAPI.UninstallAppInstance.Responses.$200> {
    return await this.delete(`/workspaces/${workspaceId}/apps/${slug}`);
  }

  async publishApp(
    body: PrismeaiAPI.PublishApp.RequestBody
  ): Promise<PrismeaiAPI.PublishApp.Responses.$200> {
    return await this.post(`/apps`, body);
  }

  async listAppInstances(
    workspaceId: PrismeaiAPI.ListAppInstances.PathParameters['workspaceId']
  ): Promise<PrismeaiAPI.ListAppInstances.Responses.$200> {
    return await this.get(`/workspaces/${workspaceId}/apps`);
  }

  async fetchImports(
    workspaceId: PrismeaiAPI.ListAppInstances.Parameters.WorkspaceId
  ): Promise<PrismeaiAPI.ListAppInstances.Responses.$200> {
    return await this.get(`/workspaces/${workspaceId}/apps`);
  }

  async getAppConfig<T>(
    workspaceId: PrismeaiAPI.GetAppInstanceConfig.Parameters.WorkspaceId,
    slug: PrismeaiAPI.GetAppInstanceConfig.Parameters.Slug
  ): Promise<T> {
    const config = await this.get<T>(
      `/workspaces/${workspaceId}/apps/${slug}/config`
    );
    return config as T;
  }

  async updateAppConfig(
    workspaceId: PrismeaiAPI.UpdateAppInstanceConfig.Parameters.WorkspaceId,
    slug: PrismeaiAPI.UpdateAppInstanceConfig.Parameters.Slug,
    config: any
  ): Promise<PrismeaiAPI.UpdateAppInstanceConfig.Responses.$200['config']> {
    await this.patch<Prismeai.AppInstance>(
      `/workspaces/${workspaceId}/apps/${slug}/config`,
      { ...config }
    );
    return config;
  }

  async uploadFiles(files: string | string[], workspaceId: string) {
    function dataURItoBlob(dataURI: string): [Blob, string] {
      // convert base64/URLEncoded data component to raw binary data held in a string
      let byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      const metadata = dataURI
        .split(';')
        .filter((v, k, all) => k < all.length - 1)
        .map((v) => v.split(/:/));
      const [, mimeString = ''] = metadata.find(([k, v]) => k === 'data') || [];
      const [, ext] = mimeString.split(/\//);
      const [, fileName = `file.${ext}`] =
        metadata.find(([k, v]) => k === 'filename') || [];

      // write the bytes of the string to a typed array
      let ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return [new Blob([ia], { type: mimeString }), fileName];
    }
    const formData = new FormData();
    (Array.isArray(files) ? files : [files]).forEach((file) => {
      formData.append('file', ...dataURItoBlob(file));
    });

    try {
      return await this._fetch<PrismeaiAPI.UploadFile.Responses.$200>(
        `/workspaces/${workspaceId}/files`,
        {
          method: 'POST',
          body: formData,
        }
      );
    } catch (e) {}
    return [];
  }

  async replaceAllImagesData(original: any, workspaceId: string) {
    const key = '…uploading-';
    const toUpload: string[] = [];
    const searchImages = (mayHaveImage: any, uploaded?: string[]) => {
      switch (typeof mayHaveImage) {
        case 'string':
          if (uploaded && mayHaveImage.match(key)) {
            // Replace with url
            const [, index] = mayHaveImage.split(key);
            return uploaded[+index];
          }
          if (mayHaveImage.match(/^data:/)) {
            toUpload.push(mayHaveImage);
            return `${key}${toUpload.length - 1}`;
          }
          return mayHaveImage;
        case 'object':
          const isArray = Array.isArray(mayHaveImage);
          const withImagesUrl = isArray
            ? [...mayHaveImage]
            : { ...mayHaveImage };
          for (const key of Object.keys(withImagesUrl)) {
            withImagesUrl[key] = searchImages(withImagesUrl[key], uploaded);
          }
          return withImagesUrl;
        default:
          return mayHaveImage;
      }
    };

    const searching = searchImages(original);

    if (toUpload.length === 0) return original;

    const uploaded = await this.uploadFiles(toUpload, workspaceId);

    const replaced = searchImages(
      searching,
      uploaded.map(({ url }) => url)
    );

    return replaced;
  }

  async callAutomation(workspaceId: string, automation: string): Promise<any> {
    return this._fetch(`/workspaces/${workspaceId}/webhooks/${automation}`);
  }
}

export default new Api('https://api.eda.prisme.ai');
