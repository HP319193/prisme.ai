import QueryString from 'qs';
import pkceChallenge from 'pkce-challenge';
import Fetcher, { Fetched } from './fetcher';
import { Event, Workspace } from './types';
import { Events } from './events';
import { removedUndefinedProperties } from './utils';
import WorkspacesEndpoint from './endpoints/workspaces';
import ApiError from './ApiError';
import UsersEndpoint from './endpoints/users';

interface PageWithMetadata extends Prismeai.Page {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type UserPermissions = {
  permissions: Prismeai.UserPermissions['permissions'];
  target: {
    id?: string;
    email?: string;
    public?: boolean;
    role?: string;
    displayName?: string;
  };
};

export interface ApiOptions {
  host: string;
  oidc?: {
    url: string;
    clientId: string;
    clientIdHeader?: string;
    redirectUri: string;
  };
}

export interface AccessToken {
  access_token: string;
  id_token: string;
  scope: string;
  expiresIn: number;
  token_type: 'Bearer';
}

export interface InteractiveSignin {
  interaction: string;
  login: string;
  password: string;
  remember?: boolean;
}

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

export class Api extends Fetcher {
  public opts: Required<ApiOptions>;
  private sessionId?: string;
  private _user?: Prismeai.User & { sessionId?: string };

  constructor(opts: ApiOptions) {
    super(opts.host, opts?.oidc?.clientIdHeader);
    this.opts = {
      ...opts,
      oidc: {
        url: 'http://studio.local.prisme.ai:3001',
        clientId: 'local-client-id',
        redirectUri: 'http://studio.local.prisme.ai:3000/signin',
        ...opts.oidc,
      },
    };
  }

  get user() {
    return this._user;
  }

  async me() {
    const me = await this.get('/me');
    this.sessionId = me.sessionId;
    this._user = me;
    return me;
  }

  clientId(): string {
    return this.overwriteClientId || this.opts?.oidc?.clientId;
  }

  async getAuthorizationURL(
    overrideRedirectUri?: string,
    authParams?: { max_age?: string; acr_values?: string },
    locale = window?.navigator?.language
      ? window.navigator.language.substring(0, 2)
      : undefined
  ) {
    const url = new URL('/oidc/auth', this.opts.oidc.url);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('response_mode', 'query'); // Send the final authorization code as a query param to the redirect uri
    url.searchParams.set(
      'redirect_uri',
      overrideRedirectUri || this.opts.oidc?.redirectUri || ''
    );
    url.searchParams.set(
      'scope',
      'openid profile email settings offline_access events:write events:read webhooks pages:read files:write files:read'
    );
    const clientId = this.clientId();
    url.searchParams.set('client_id', clientId);

    url.searchParams.set('code_challenge_method', 'S256');
    const { code_verifier: codeVerifier, code_challenge: codeChallenge } =
      await pkceChallenge(64);
    url.searchParams.set('code_challenge', codeChallenge);
    if (locale) {
      url.searchParams.set('locale', locale);
    }

    Object.entries(authParams || {}).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    return {
      url: url.toString(),
      codeVerifier,
      clientId,
    };
  }

  async signin(body: InteractiveSignin): Promise<{ redirectTo: string }> {
    const url = new URL(
      `/oidc/interaction/${body.interaction}/login`,
      this.opts.oidc.url
    );

    // Do not follow redirects as we need to get redirected from browser itself to save final token in local storage
    await this.post(url.toString(), new URLSearchParams(body as any), {
      redirect: 'manual',
    });
    const redirectTo = new URL(
      `/oidc/auth/${body.interaction}`,
      this.opts.oidc.url
    );
    return { redirectTo: redirectTo.toString() };
  }

  async getToken(
    authorizationCode: string,
    codeVerifier: string,
    overrideRedirectUri?: string
  ): Promise<AccessToken> {
    this.token = null;
    const url = new URL('/oidc/token', this.opts.oidc.url);
    const token = await this.post<AccessToken>(
      url.toString(),
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        code_verifier: codeVerifier,
        client_id: this.clientId(),
        redirect_uri: overrideRedirectUri || this.opts.oidc.redirectUri,
      })
    );
    return token;
  }

  async createAnonymousSession(): Promise<
    Prismeai.User & {
      token: string;
    }
  > {
    const user = await this.post<
      Prismeai.User & {
        token: string;
      }
    >(
      '/login/anonymous',
      {},
      {
        credentials: 'omit',
      }
    );
    this._user = user;
    return user;
  }

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    language: string
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
      language,
    });
  }

  getSignoutURL(redirectUri?: string) {
    const params = new URLSearchParams();
    params.set('client_id', this.clientId());
    if (redirectUri) {
      params.set('post_logout_redirect_uri', redirectUri);
    }
    const url = new URL(
      `/oidc/session/end?${params.toString()}`,
      this.opts.oidc.url
    );
    return url.toString();
  }

  // Mail validation
  async sendValidationMail(email: string, language: string) {
    return await this.post('/user/validate', { email, language });
  }

  async validateMail(token: string) {
    return await this.post('/user/validate', { token });
  }

  // Password reset
  async sendPasswordResetMail(email: string, language: string) {
    return await this.post('/user/password', { email, language });
  }

  async passwordReset(token: string, password: string) {
    return await this.post('/user/password', { token, password });
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return await this.get('/workspaces?limit=2000');
  }

  async getWorkspace(
    id: string
  ): Promise<PrismeaiAPI.GetWorkspace.Responses.$200> {
    return await this.get(`/workspaces/${id}`);
  }

  async getWorkspaceSecurity(
    id: string
  ): Promise<PrismeaiAPI.GetSecurity.Responses.$200> {
    return await this.get(`/workspaces/${id}/security`);
  }

  async updateWorkspaceSecurity(
    workspaceId: string,
    security: Prismeai.WorkspaceSecurity
  ): Promise<Fetched<PrismeaiAPI.UpdateSecurity.Responses.$200>> {
    return await this.put(`/workspaces/${workspaceId}/security`, security);
  }

  async getWorkspaceRoles(
    id: string
  ): Promise<Fetched<PrismeaiAPI.GetRoles.Responses.$200>> {
    return await this.get(`/workspaces/${id}/security/roles`);
  }

  async createWorkspace(name: string): Promise<Workspace> {
    return await this.post('/workspaces', { name });
  }

  async duplicateWorkspace({ id }: { id: string }): Promise<Workspace | null> {
    return await this.post(`/workspaces/${id}/versions/current/duplicate`, {});
  }

  async updateWorkspace(
    workspace: Prismeai.DSULPatch
  ): Promise<Fetched<PrismeaiAPI.UpdateWorkspace.Responses.$200> | null> {
    if (!workspace.id) return null;
    return await this.patch(
      `/workspaces/${workspace.id}`,
      await this.replaceAllImagesData(workspace, workspace.id)
    );
  }

  async deleteWorkspace(workspaceId: Workspace['id']): Promise<Workspace> {
    return await this.delete(`/workspaces/${workspaceId}`);
  }

  async generateApiKey(
    workspaceId: Workspace['id'],
    events: string[],
    uploads?: string[]
  ) {
    const { apiKey } = await this.post<{ apiKey: string }>(
      `/workspaces/${workspaceId}/apiKeys`,
      {
        rules: {
          events: {
            types: events,
            filters: {
              'source.sessionId': '${user.sessionId}',
            },
          },
          uploads: uploads
            ? {
                mimetypes: uploads,
              }
            : undefined,
        },
      }
    );

    return apiKey;
  }
  async updateApiKey(
    workspaceId: Workspace['id'],
    apiKey: string,
    events: string[],
    uploads?: string[]
  ) {
    await this.put(`/workspaces/${workspaceId}/apiKeys/${apiKey}`, {
      rules: {
        events: {
          types: events,
          filters: {
            'source.sessionId': '${user.sessionId}',
          },
        },
        uploads: uploads
          ? {
              mimetypes: uploads,
            }
          : undefined,
      },
    });

    return apiKey;
  }

  // Automations
  async getAutomation(
    workspaceId: string,
    automationSlug: string
  ): Promise<Fetched<PrismeaiAPI.GetAutomation.Responses.$200>> {
    return await this.get(
      `/workspaces/${workspaceId}/automations/${encodeURIComponent(
        automationSlug
      )}`
    );
  }

  async createAutomation(
    workspaceId: Workspace['id'],
    automation: Prismeai.Automation
  ): Promise<Fetched<Prismeai.Automation & { slug: string }>> {
    return await this.post(`/workspaces/${workspaceId}/automations`, {
      ...automation,
    });
  }

  async updateAutomation(
    workspaceId: string,
    slug: string,
    automation: Prismeai.Automation
  ): Promise<Fetched<Prismeai.Automation & { slug: string }>> {
    return await this.patch(
      `/workspaces/${workspaceId}/automations/${encodeURIComponent(slug)}`,
      await this.replaceAllImagesData(automation, workspaceId)
    );
  }

  async deleteAutomation(workspaceId: string, slug: string): Promise<string> {
    return await this.delete(
      `/workspaces/${workspaceId}/automations/${encodeURIComponent(slug)}`
    );
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
    pageSlug: PrismeaiAPI.GetPage.Parameters.Slug
  ): Promise<Fetched<Prismeai.DetailedPage>> {
    return await this.get(
      `/workspaces/${workspaceId}/pages/${encodeURIComponent(pageSlug)}`
    );
  }

  async getPageBySlug(
    workspaceSlug: PrismeaiAPI.GetPageBySlug.Parameters.WorkspaceSlug,
    pageSlug: PrismeaiAPI.GetPageBySlug.Parameters.PageSlug
  ): Promise<Fetched<Prismeai.DetailedPage>> {
    return await this.get(
      `/pages/${workspaceSlug}/${encodeURIComponent(pageSlug)}`
    );
  }

  async createPage(
    workspaceId: PrismeaiAPI.CreatePage.Parameters.WorkspaceId,
    page: PrismeaiAPI.CreatePage.RequestBody
  ): Promise<Prismeai.Page> {
    const { createdAt, createdBy, updatedAt, updatedBy, ...newPage } =
      await this.post<PageWithMetadata>(
        `/workspaces/${workspaceId}/pages`,
        page
      );
    return newPage;
  }

  async updatePage(
    workspaceId: PrismeaiAPI.UpdatePage.Parameters.WorkspaceId,
    page: PrismeaiAPI.UpdatePage.RequestBody,
    prevSlug: PrismeaiAPI.DeletePage.Parameters.Slug = page.slug || ''
  ): Promise<Prismeai.Page> {
    const { createdAt, createdBy, updatedAt, updatedBy, ...updatedPage } =
      await this.patch<PageWithMetadata>(
        `/workspaces/${workspaceId}/pages/${encodeURIComponent(prevSlug)}`,
        // Replace images as dataurl to uploaded url in any type of data
        await this.replaceAllImagesData(page, workspaceId)
      );
    return updatedPage;
  }

  async deletePage(
    workspaceId: PrismeaiAPI.DeletePage.Parameters.WorkspaceId,
    pageSlug: PrismeaiAPI.DeletePage.Parameters.Slug
  ): Promise<Fetched<PrismeaiAPI.DeletePage.Responses.$200>> {
    return await this.delete(
      `/workspaces/${workspaceId}/pages/${encodeURIComponent(pageSlug)}`
    );
  }

  // Events
  streamEvents(
    workspaceId: string,
    filters?: Record<string, any>
  ): Promise<Events> {
    if (filters && filters['source.sessionId'] === true) {
      if (this.sessionId) {
        filters['source.sessionId'] = this.sessionId;
      } else {
        delete filters['source.sessionId'];
      }
    }
    const events = new Events({
      workspaceId,
      token: this.token || '',
      legacyToken: this.legacyToken || '',
      apiKey: this._apiKey ? this._apiKey : undefined,
      apiHost: this.host,
      filters,
      api: this,
    });
    return new Promise((resolve, reject) => {
      const off = events.once('connect_error', () => {
        reject();
        events.close();
      });
      events.once('connect', () => {
        off();
        resolve(events);
      });
    });
  }

  async getEvents(
    workspaceId: string,
    options: Record<string, any> = {}
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

  async findContacts(
    query: PrismeaiAPI.FindContacts.RequestBody
  ): Promise<PrismeaiAPI.FindContacts.Responses.$200> {
    return await this.post(`/contacts`, query);
  }

  async getPermissions(
    subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType,
    subjectId: string
  ): Promise<{ result: UserPermissions[] }> {
    const permissions: PrismeaiAPI.GetPermissions.Responses.$200 =
      await this.get(`/${subjectType}/${subjectId}/permissions`);
    const contacts = await this.findContacts({
      ids: permissions.result
        .filter((cur) => cur.target.id && !cur.target.displayName)
        .map((cur) => cur.target.id!),
    });
    return {
      result: permissions.result.map((perm) => {
        const user =
          perm.target.id && !perm.target.displayName
            ? contacts.contacts.find((cur) => cur.id === perm.target.id)
            : undefined;
        const displayName =
          perm.target.displayName || `${user?.firstName} ${user?.lastName}`;
        return {
          ...perm,
          target: {
            ...perm.target,
            id: perm.target.id!,
            displayName,
          },
        };
      }),
    };
  }

  async addPermissions(
    subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType,
    subjectId: string,
    permissions: UserPermissions
  ): Promise<UserPermissions> {
    const body = { ...permissions };
    const { email } = permissions.target;

    if (email) {
      const contacts = await this.findContacts({
        email,
      });

      if (!contacts.contacts.length) {
        throw new ApiError(
          {
            error: 'CollaboratorNotFound',
            message: 'This user does not exist',
            details: { email },
          },
          404
        );
      }
      body.target = { id: contacts.contacts[0].id };
    }

    const result: PrismeaiAPI.Share.Responses.$200 = await this.post(
      `/${subjectType}/${subjectId}/permissions`,
      body
    );
    return {
      ...result,
      target: {
        ...result.target,
        id: result.target.id!,
        email,
      },
    };
  }

  async deletePermissions(
    subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType,
    subjectId: string,
    id: string
  ): Promise<Fetched<PrismeaiAPI.RevokePermissions.Responses.$200>> {
    return await this.delete(`/${subjectType}/${subjectId}/permissions/${id}`);
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
  }): Promise<Fetched<PrismeaiAPI.SearchApps.Responses.$200>> {
    const params = new URLSearchParams(
      removedUndefinedProperties(
        {
          text: `${encodeURIComponent(query || '')}`,
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
  ): Promise<Fetched<PrismeaiAPI.InstallAppInstance.Responses.$200>> {
    return await this.post(`/workspaces/${workspaceId}/apps`, body);
  }

  async updateApp(
    workspaceId: PrismeaiAPI.ConfigureAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.ConfigureAppInstance.PathParameters['slug'],
    body: PrismeaiAPI.ConfigureAppInstance.RequestBody
  ): Promise<Fetched<PrismeaiAPI.ConfigureAppInstance.Responses.$200>> {
    return await this.patch(`/workspaces/${workspaceId}/apps/${slug}`, body);
  }

  async uninstallApp(
    workspaceId: PrismeaiAPI.UninstallAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.ConfigureAppInstance.PathParameters['slug']
  ): Promise<Fetched<PrismeaiAPI.UninstallAppInstance.Responses.$200>> {
    return await this.delete(`/workspaces/${workspaceId}/apps/${slug}`);
  }

  async publishApp(
    body: PrismeaiAPI.PublishApp.RequestBody
  ): Promise<Fetched<PrismeaiAPI.PublishApp.Responses.$200>> {
    return await this.post(`/apps`, body);
  }

  async listAppInstances(
    workspaceId: PrismeaiAPI.ListAppInstances.PathParameters['workspaceId']
  ): Promise<Fetched<PrismeaiAPI.ListAppInstances.Responses.$200>> {
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

  async getAppInstance(
    workspaceId: string,
    slug: string
  ): Promise<Fetched<PrismeaiAPI.GetAppInstance.Responses.$200>> {
    return this.get(`/workspaces/${workspaceId}/apps/${slug}`);
  }

  async saveAppInstance(
    workspaceId: PrismeaiAPI.ConfigureAppInstance.Parameters.WorkspaceId,
    slug: PrismeaiAPI.ConfigureAppInstance.Parameters.Slug,
    appInstance: PrismeaiAPI.ConfigureAppInstance.RequestBody
  ): Promise<Fetched<PrismeaiAPI.ConfigureAppInstance.Responses.$200>> {
    const response = await this.patch<Prismeai.DetailedAppInstance>(
      `/workspaces/${workspaceId}/apps/${slug}`,
      { ...appInstance }
    );
    return response;
  }

  async uploadFiles(
    files: string | string[],
    workspaceId: string,
    expiresAfter?: number
  ) {
    const formData = new FormData();
    (Array.isArray(files) ? files : [files]).forEach((file) => {
      try {
        formData.append('file', ...dataURItoBlob(file));
      } catch {}
    });
    if (expiresAfter) {
      formData.append('expiresAfter', `${expiresAfter}`);
    }
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

  async callAutomation(
    workspaceId: string,
    automation: string,
    params?: any
  ): Promise<Fetched<any>> {
    return this.post(
      `/workspaces/${workspaceId}/webhooks/${automation}`,
      params
    );
  }

  async testAutomation({
    workspaceId,
    automation,
    payload,
  }: {
    workspaceId: string;
    automation: string;
    payload?: Record<string, any>;
  }): Promise<Fetched<any>> {
    return this.post(`/workspaces/${workspaceId}/test/${automation}`, {
      payload,
    });
  }

  async getWorkspaceUsage(
    workspaceId: PrismeaiAPI.WorkspaceUsage.Parameters.WorkspaceId,
    {
      afterDate,
      beforeDate,
      details,
    }: {
      afterDate?: PrismeaiAPI.WorkspaceUsage.Parameters.AfterDate;
      beforeDate?: PrismeaiAPI.WorkspaceUsage.Parameters.BeforeDate;
      details?: PrismeaiAPI.WorkspaceUsage.Parameters.Details;
    } = {}
  ): Promise<Fetched<PrismeaiAPI.WorkspaceUsage.Responses.$200>> {
    const params = new URLSearchParams(
      removedUndefinedProperties(
        {
          afterDate: `${afterDate || ''}`,
          beforeDate: `${beforeDate || ''}`,
          details: `${details || ''}`,
        },
        true
      )
    );

    return this.get(`/workspaces/${workspaceId}/usage?${params.toString()}`);
  }

  async importArchive(
    archive: File
  ): Promise<PrismeaiAPI.ImportNewWorkspace.Responses.$200> {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', async ({ target }) => {
        const file = target?.result as string;
        const formData = new FormData();
        formData.append('archive', ...dataURItoBlob(file));
        resolve(
          await this._fetch<PrismeaiAPI.ImportNewWorkspace.Responses.$200>(
            `/workspaces/import`,
            {
              method: 'POST',
              body: formData,
            }
          )
        );
      });
      fileReader.readAsDataURL(archive);
    });
  }

  users(id: string = this.user?.id || '') {
    if (!id) {
      throw new Error();
    }
    return new UsersEndpoint(id, this);
  }
  workspaces(id: string) {
    return new WorkspacesEndpoint(id, this);
  }
}

export default new Api({ host: 'https://api.eda.prisme.ai' });
