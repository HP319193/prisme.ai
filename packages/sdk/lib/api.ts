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
    return await this.get('/workspaces');
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return await this.get(`/workspaces/${id}`);
  }

  async createWorkspace(name: string): Promise<Workspace> {
    return await this.post('/workspaces', { name });
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return await this.patch(`/workspaces/${workspace.id}`, workspace);
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
  ): Promise<Prismeai.Automation> {
    return await this.patch(
      `/workspaces/${workspace.id}/automations/${slug}`,
      automation
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
      page
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
  streamEvents(workspaceId: string) {
    return new Events(workspaceId, this.token || '', this.host);
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

  async getApps(
    text:
      | PrismeaiAPI.SearchApps.QueryParameters['text']
      | undefined = undefined,
    page:
      | PrismeaiAPI.SearchApps.QueryParameters['page']
      | undefined = undefined,
    limit:
      | PrismeaiAPI.SearchApps.QueryParameters['limit']
      | undefined = undefined
  ): Promise<PrismeaiAPI.SearchApps.Responses.$200> {
    const params = new URLSearchParams(
      removedUndefinedProperties(
        {
          text: `${text || ''}`,
          page: `${page || ''}`,
          limit: `${limit || ''}`,
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
}

export default new Api('https://api.eda.prisme.ai');
