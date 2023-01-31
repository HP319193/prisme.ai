import { PUBLIC_API_URL } from '../../../config';
import { EventType } from '../../eda';
import { PrismeError } from '../../errors';
import { logger } from '../../logger';
import { interpolate } from '../../utils';
import { findSecretValues, findSecretPaths } from '../../utils/secrets';
import { Apps } from '../apps';

export type DetailedTrigger = {
  type: 'event' | 'endpoint' | 'schedule';
  value: string;
  automationSlug: string;
  workspace: Workspace;
};

export type DetailedAutomation = Prismeai.Automation & {
  workspace: Workspace;
  secretPaths: string[];
};
export type AppName = string;
export type AutomationName = string;
type EventName = string;
type EndpointName = string;
type ScheduleName = string;

export interface Triggers {
  events: Record<EventName, DetailedTrigger[]>;
  endpoints: Record<EndpointName, DetailedTrigger[]>;
  schedules: Record<ScheduleName, DetailedTrigger[]>;
}

export type ParsedAutomationName = [AppName, AutomationName];

export interface AppContext {
  appSlug: string;
  appInstanceSlug: string;
  appInstanceFullSlug: string;
  parentAppSlug?: string;
  parentAppSlugs: string[];
}

export class Workspace {
  public dsul: Prismeai.RuntimeModel;
  public name: string;
  public id: string;
  public config: any;
  private triggers: Triggers;
  public imports: Record<string, Workspace>;

  public appContext?: AppContext;
  private apps: Apps;
  public secrets: Set<string>;

  public status?: Prismeai.SuspendedWorkspace['payload'];

  private constructor(
    workspace: Prismeai.RuntimeModel,
    apps: Apps,
    appContext?: AppContext
  ) {
    this.apps = apps;
    this.name = workspace.name;
    this.id = workspace.id!!;
    this.config = {};
    this.triggers = { events: {}, endpoints: {}, schedules: {} };

    this.dsul = workspace;
    this.imports = {};
    this.appContext = appContext;
    this.secrets = new Set();
  }

  static async create(
    dsul: Prismeai.RuntimeModel,
    apps: Apps,
    appContext?: AppContext,
    overrideConfig?: any
  ) {
    const workspace = new Workspace(dsul, apps, appContext);
    await workspace.loadModel({
      ...dsul,
      config: {
        ...dsul.config,
        value: {
          ...dsul.config?.value,
          ...overrideConfig,
        },
      },
    });
    return workspace;
  }

  async loadModel(workspace: Prismeai.RuntimeModel) {
    this.updateConfig(workspace.config || {});
    const { automations = {}, imports = {} } = workspace;
    this.triggers = Object.keys(automations).reduce(
      (prev, key) => {
        const automation = automations[key];
        const {
          when,
          when: { events, endpoint, schedules } = {},
          disabled,
        } = automation;
        if (!when || disabled) return prev;
        if (events) {
          events.forEach((event) => {
            prev.events[event] = [
              ...(prev.events[event] || []),
              {
                type: 'event',
                value: event,
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
              type: 'endpoint',
              value: endpointName,
              automationSlug: key,
              workspace: this,
            },
          ];
        }
        if (schedules) {
          schedules.forEach((schedule) => {
            prev.schedules[schedule] = [
              ...(prev.schedules[schedule] || []),
              {
                type: 'schedule',
                value: schedule,
                automationSlug: key,
                workspace: this,
              },
            ];
          });
        }
        return prev;
      },
      { events: {}, endpoints: {}, schedules: {} } as Triggers
    );

    this.dsul = workspace;

    // Pull app instances
    for (let [slug, appInstance] of Object.entries(imports || {})) {
      await this.updateImport(slug, appInstance);
    }
  }

  updateConfig(config: Prismeai.Config) {
    this.config = interpolate(config?.value || {}, {
      config: config?.value || {},
    });
    this.secrets = findSecretValues(
      this.config,
      findSecretPaths(config?.schema || {})
    );

    this.dsul = {
      ...this.dsul,
      config,
    };
  }

  async updateImport(slug: string, appInstance: Prismeai.AppInstance) {
    this.dsul.imports = {
      ...this.dsul.imports,
      [slug]: appInstance,
    };

    if (appInstance.disabled) {
      // Remove any existing appInstance
      delete this.imports[slug];
      return;
    }

    const { appSlug, appVersion } = appInstance;
    const parentAppSlugs = this.appContext?.parentAppSlugs || [];
    if (parentAppSlugs.includes(appSlug)) {
      throw new PrismeError(
        `Recursive import detected : cannot import appSlug '${appSlug}' inside app '${
          parentAppSlugs[parentAppSlugs.length - 1]
        }' `,
        {}
      );
    }
    try {
      const dsul = await this.apps.getApp(appSlug, appVersion);
      const importParentAppSlugs = parentAppSlugs.concat(appSlug);
      const interpolatedAppConfig = interpolate(appInstance.config || {}, {
        config: this.config,
      });
      this.imports[slug] = await Workspace.create(
        dsul,
        this.apps,
        {
          appSlug: appSlug,
          appInstanceFullSlug: this.appContext
            ? `${this.appContext.appInstanceFullSlug}.${slug}`
            : slug,
          appInstanceSlug: slug,
          parentAppSlugs: importParentAppSlugs,
          parentAppSlug:
            (importParentAppSlugs?.length || 0) > 1
              ? importParentAppSlugs[importParentAppSlugs.length - 2]
              : undefined,
        },
        interpolatedAppConfig
      );
      return this.imports[slug];
    } catch (err) {
      logger.warn({
        msg: `Could not import app ${appSlug} in workspace ${this.id}`,
        workspaceId: this.id,
        appSlug,
        err,
      });
      return;
    }
  }

  deleteImport(slug: string) {
    delete this.imports[slug];
    delete this.dsul.imports?.[slug];
  }

  async updateAutomation(
    automationSlug: string,
    automation: Prismeai.Automation
  ) {
    const newAutomations = {
      ...this.dsul.automations,
    };
    newAutomations[automationSlug] = automation;
    await this.loadModel({ ...this.dsul, automations: newAutomations });
  }

  async deleteAutomation(automationSlug: string) {
    const newAutomations = { ...this.dsul.automations };
    delete newAutomations[automationSlug];

    await this.loadModel({
      ...this.dsul,
      automations: newAutomations,
    });
  }

  listNestedImports(): Record<string, string> {
    return Object.values(this.imports).reduce(
      (imports, workspace) => ({
        ...imports,
        [workspace.appContext?.appInstanceFullSlug!]:
          workspace.appContext?.appSlug,
        ...workspace.listNestedImports(),
      }),
      {}
    );
  }

  getEventTriggers(event: Prismeai.PrismeEvent): DetailedTrigger[] {
    if (event.type === EventType.TriggeredSchedule) {
      const { appInstanceSlug, ...payload } =
        (event as Prismeai.TriggeredSchedule).payload || {};
      if (appInstanceSlug && appInstanceSlug in this.imports) {
        return this.imports[appInstanceSlug].getEventTriggers({
          ...event,
          payload,
        });
      }
      return this.triggers.schedules[payload.schedule] || [];
    }
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
    // Few native events (not prefixed with an appInstanceSlug) are appInstance related (i.e ConfiguredApp)
    else if (
      event.source.appInstanceFullSlug &&
      event.source.appInstanceFullSlug in this.imports
    ) {
      triggers.push(
        ...this.imports[event.source.appInstanceFullSlug].getEventTriggers(
          event
        )
      );
    }

    return triggers;
  }

  getEndpointTriggers(slug: string) {
    const triggers = this.triggers.endpoints[slug] || [];

    const [appSlug, name] = this.parseAppRef(slug);
    if (appSlug && appSlug in this.imports) {
      triggers.push(...this.imports[appSlug].getEndpointTriggers(name));
    }

    return triggers;
  }

  getEndpointUrls(workspaceId: string) {
    return Object.keys(this.triggers.endpoints).reduce((urls, slug) => {
      const fullEndpointSlug = encodeURIComponent(
        `${
          this.appContext?.appInstanceFullSlug
            ? this.appContext?.appInstanceFullSlug + '.'
            : ''
        }${slug}`
      );
      return {
        ...urls,
        [slug]: `${PUBLIC_API_URL}/workspaces/${workspaceId}/webhooks/${fullEndpointSlug}`,
      };
    }, {});
  }

  private parseAppRef(name: string): ParsedAutomationName {
    const appSeparatorIdx = name.indexOf('.');
    return appSeparatorIdx !== -1
      ? [name.slice(0, appSeparatorIdx), name.slice(appSeparatorIdx + 1)]
      : ['', name];
  }

  getAutomation(
    slug: string,
    allowNested: boolean = true
  ): DetailedAutomation | null {
    const [appSlug, name] = this.parseAppRef(slug);
    if (appSlug && allowNested) {
      if (!(appSlug in this.imports)) {
        return null;
      }
      return this.imports[appSlug].getAutomation(name, false);
    }

    const automation = (this.dsul.automations || {})[appSlug ? slug : name];

    if (
      !automation ||
      automation.disabled ||
      (automation.private && !allowNested)
    ) {
      return null;
    }

    return {
      slug: name,
      ...automation,
      workspace: this,
      secretPaths: automation.arguments
        ? findSecretPaths(automation.arguments)
        : [],
    };
  }
}
