import { Apps } from '../apps';

export type DetailedTrigger = Prismeai.When & {
  automationSlug: string;
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
export class Workspace {
  private dsul: Prismeai.Workspace;
  public name: string;
  public id: string;
  private triggers: Triggers;
  private imports: Record<string, Workspace>;

  private apps: Apps;

  private constructor(workspace: Prismeai.Workspace, apps: Apps) {
    this.apps = apps;
    this.name = workspace.name;
    this.id = workspace.id!!;
    this.triggers = { events: {}, endpoints: {} };

    this.dsul = workspace;
    this.imports = {};
  }

  static async create(dsul: Prismeai.Workspace, apps: Apps) {
    const workspace = new Workspace(dsul, apps);
    await workspace.update(dsul);
    return workspace;
  }

  async update(workspace: Prismeai.Workspace) {
    this.name = workspace.name;

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
        events: {
          ...workspace.triggers.events,
          ...this.triggers.events,
        },
        endpoints: {
          ...workspace.triggers.endpoints,
          ...this.triggers.endpoints,
        },
      };
    }
  }

  async updateImport(slug: string, appInstance: Prismeai.AppInstance) {
    const { appId, appVersion } = appInstance;
    const dsul = await this.apps.getApp(appId, appVersion);
    this.imports[slug] = await Workspace.create(dsul, this.apps);
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

  getEventTriggers(event: string) {
    return this.triggers.events[event];
  }

  getEndpointTriggers(slug: string) {
    return this.triggers.endpoints[slug];
  }

  private parseAutomationName(name: string): ParsedAutomationName {
    const appSeparatorIdx = name.indexOf('.');
    return appSeparatorIdx !== -1
      ? [name.slice(0, appSeparatorIdx), name.slice(appSeparatorIdx + 1)]
      : ['', name];
  }

  getAutomation(slug: string): Prismeai.Automation | null {
    const [appSlug, name] = this.parseAutomationName(slug);
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
    };
  }
}
