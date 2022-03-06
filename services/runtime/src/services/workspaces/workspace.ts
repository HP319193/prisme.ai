import { PrismeEvent } from '@prisme.ai/broker';
import { PrismeError } from '../../errors';
import { Apps } from '../apps';

export type DetailedTrigger = Prismeai.When & {
  automationSlug: string;
  workspace: Workspace;
};

export type DetailedAutomation = Prismeai.Automation & {
  workspace: Workspace;
};
export type AppName = string;
export type AutomationName = string;
type EventName = string;
type EndpointName = string;
export interface Triggers {
  events: Record<EventName, DetailedTrigger[]>;
  endpoints: Record<EndpointName, DetailedTrigger[]>;
}

export type ParsedAutomationName = [AppName, AutomationName];

export interface AppContext {
  appId: string;
  appInstanceSlug: string;
  parentAppIds: string[];
}

export class Workspace {
  private dsul: Prismeai.Workspace;
  public name: string;
  public id: string;
  public config: any;
  private triggers: Triggers;
  private imports: Record<string, Workspace>;

  public appContext?: AppContext;
  private apps: Apps;

  private constructor(
    workspace: Prismeai.Workspace,
    apps: Apps,
    appContext?: AppContext
  ) {
    this.apps = apps;
    this.name = workspace.name;
    this.id = workspace.id!!;
    this.config = {};
    this.triggers = { events: {}, endpoints: {} };

    this.dsul = workspace;
    this.imports = {};
    this.appContext = appContext;
  }

  private parseTypedConfig(typedConfig: Prismeai.DSULConfig) {
    return Object.entries(typedConfig).reduce(
      (config, [k, { type, value }]) => {
        return {
          ...config,
          [k]: value,
        };
      },
      {}
    );
  }

  static async create(
    dsul: Prismeai.Workspace,
    apps: Apps,
    appContext?: AppContext,
    overrideConfig?: any
  ) {
    const workspace = new Workspace(dsul, apps, appContext);
    await workspace.update(dsul);
    if (overrideConfig) {
      workspace.config = overrideConfig;
    }
    return workspace;
  }

  async update(workspace: Prismeai.Workspace) {
    this.name = workspace.name;
    this.config = this.parseTypedConfig(workspace.config || {});

    const { automations = {}, imports = {} } = workspace;
    this.triggers = Object.keys(automations).reduce(
      (prev, key) => {
        const automation = automations[key];
        const { when, when: { events, endpoint } = {} } = automation;
        if (!when) return prev;
        if (events) {
          events.forEach((event) => {
            prev.events[event] = [
              ...(prev.events[event] || []),
              {
                ...when,
                automationSlug: key,
                workspace: this,
              },
            ];
          });
        }
        if (endpoint) {
          const endpointName = endpoint === true ? key : endpoint;
          prev.endpoints[endpointName] = [
            ...(prev.endpoints[endpointName] || []),
            {
              ...when,
              automationSlug: key,
              workspace: this,
            },
          ];
        }
        return prev;
      },
      { events: {}, endpoints: {} } as Triggers
    );

    this.dsul = workspace;

    // Pull app instances
    for (let [slug, appInstance] of Object.entries(imports || {})) {
      const workspace = await this.updateImport(slug, appInstance);
      this.triggers = {
        ...this.triggers,
        endpoints: {
          ...workspace.triggers.endpoints,
          ...this.triggers.endpoints,
        },
      };
    }
  }

  async updateImport(slug: string, appInstance: Prismeai.AppInstance) {
    const parentAppIds = this.appContext?.parentAppIds || [];
    if (parentAppIds.includes(appInstance.appId)) {
      throw new PrismeError(
        `Recursive import detected : cannot import appId '${
          appInstance.appId
        }' inside app '${parentAppIds[parentAppIds.length - 1]}' `,
        {}
      );
    }
    const { appId, appVersion } = appInstance;
    const dsul = await this.apps.getApp(appId, appVersion);
    this.imports[slug] = await Workspace.create(
      dsul,
      this.apps,
      {
        appId: appId,
        appInstanceSlug: this.appContext
          ? `${this.appContext.appInstanceSlug}.${slug}`
          : slug,
        parentAppIds: (this.appContext?.parentAppIds || []).concat(appId),
      },
      appInstance.config || {}
    );
    return this.imports[slug];
  }

  deleteImport(slug: string) {
    delete this.imports[slug];
  }

  async updateAutomation(
    automationSlug: string,
    automation: Prismeai.Automation
  ) {
    const newAutomations = {
      ...this.dsul.automations,
    };
    newAutomations[automationSlug] = automation;
    await this.update({ ...this.dsul, automations: newAutomations });
  }

  async deleteAutomation(automationSlug: string) {
    const newAutomations = { ...this.dsul.automations };
    delete newAutomations[automationSlug];

    await this.update({
      ...this.dsul,
      automations: newAutomations,
    });
  }

  getEventTriggers(event: PrismeEvent) {
    const triggers = this.triggers.events[event.type] || [];
    const [firstAppSlug, nestedAppSlugs] = this.parseAppRef(event.type);
    if (firstAppSlug in this.imports) {
      triggers.push(
        ...this.imports[firstAppSlug].getEventTriggers({
          ...event,
          type: nestedAppSlugs,
        })
      );
    }

    return triggers;
  }

  getEndpointTriggers(slug: string) {
    return this.triggers.endpoints[slug];
  }

  private parseAppRef(name: string): ParsedAutomationName {
    const appSeparatorIdx = name.indexOf('.');
    return appSeparatorIdx !== -1
      ? [name.slice(0, appSeparatorIdx), name.slice(appSeparatorIdx + 1)]
      : ['', name];
  }

  getAutomation(slug: string): DetailedAutomation | null {
    const [appSlug, name] = this.parseAppRef(slug);
    if (appSlug) {
      if (!(appSlug in this.imports)) {
        return null;
      }
      return this.imports[appSlug].getAutomation(name);
    }

    const automation = (this.dsul.automations || {})[name];

    if (!automation) return null;

    return {
      slug: name,
      ...automation,
      workspace: this,
    };
  }
}
