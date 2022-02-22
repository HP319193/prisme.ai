import QueryString from 'qs';
import Fetcher from './fetcher';
import { Event, Workspace } from './types';

type UserPermissions = Prismeai.UserPermissions;

import { Events } from './events';

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
  async createPage(
    workspace: Workspace,
    page: Prismeai.Page
  ): Promise<Prismeai.Page & { slug: string }> {
    return await this.post(`/workspaces/${workspace.id}/pages`, {
      ...page,
    });
  }

  async updatePage(
    workspace: Workspace,
    slug: string,
    page: Prismeai.Page
  ): Promise<Prismeai.Page> {
    return await this.patch(`/workspaces/${workspace.id}/pages/${slug}`, page);
  }

  async deletePage(workspace: Workspace, slug: string): Promise<string> {
    return await this.delete(`/workspaces/${workspace.id}/pages/${slug}`);
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
}

export default new Api('https://api.eda.prisme.ai');
