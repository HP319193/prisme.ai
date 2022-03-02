import { Apps } from '../apps';

export type DetailedTrigger = Prismeai.When & {
  automationSlug: string;
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

  constructor(workspace: Prismeai.Workspace, apps: Apps) {
    this.apps = apps;
    this.name = workspace.name;
    this.id = workspace.id!!;
    this.triggers = { events: {}, endpoints: {} };

    this.dsul = workspace;
    this.imports = {};
    this.update(workspace);
  }

  update(workspace: Prismeai.Workspace) {
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
            },
          ];
        }
        return prev;
      },
      { events: {}, endpoints: {} } as Triggers
    );

    this.dsul = workspace;

    Object.entries(imports || {}).forEach(async ([slug, appInstance]) => {
      await this.updateImport(slug, appInstance);
    });
  }

  async updateImport(slug: string, appInstance: Prismeai.AppInstance) {
    const { appId, appVersion } = appInstance;
    const dsul = await this.apps.getApp(appId, appVersion);
    this.imports[slug] = new Workspace(dsul, this.apps);
  }

  deleteImport(slug: string) {
    delete this.imports[slug];
  }

  updateAutomation(automationSlug: string, automation: Prismeai.Automation) {
    const newAutomations = {
      ...this.dsul.automations,
    };
    newAutomations[automationSlug] = automation;
    this.update({ ...this.dsul, automations: newAutomations });
  }

  deleteAutomation(automationSlug: string) {
    const newAutomations = { ...this.dsul.automations };
    delete newAutomations[automationSlug];

    this.update({
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
