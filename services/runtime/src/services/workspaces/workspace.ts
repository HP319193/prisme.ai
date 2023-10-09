import { API_URL } from '../../../config';
import { EventType } from '../../eda';
import { PrismeError } from '../../errors';
import { logger } from '../../logger';
import { interpolate } from '../../utils';
import { extractConfigFromEnv } from '../../utils/extractConfigFromEnv';
import { findSecretValues, findSecretPaths } from '../../utils/secrets';
import { Apps } from '../apps';
import { Trigger } from '../runtime/contexts';

export type DetailedTrigger = Trigger & {
  automationSlug: string;
  workspace: Workspace;
};

export type DetailedAutomation = Prismeai.Automation & {
  workspace: Workspace;
  runningWorkspaceId: string; // Might be different from workspace.id if workspace is an app
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
  runningWorkspaceId: string;
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
    let additionalConfigFromEnv = {};
    if (this.appContext?.appSlug) {
      additionalConfigFromEnv = extractConfigFromEnv(
        'app',
        this.appContext.appSlug
      );
    } else if (this.dsul?.slug) {
      additionalConfigFromEnv = extractConfigFromEnv(
        'workspace',
        this.dsul.slug
      );
    }

    const configValue = {
      ...additionalConfigFromEnv,
      ...config?.value,
    };
    this.config = interpolate(
      configValue,
      {
        // App config var from env vars should not be accessible to workspace appInstances config (only from the app automations)
        config: this.appContext?.appSlug ? config?.value || {} : configValue,
      },
      {
        undefinedVars: 'leave',
        evalExpr: false,
      }
    );
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
      const interpolatedAppConfig = interpolate(
        appInstance.config || {},
        {
          config: this.config,
        },
        {
          undefinedVars: 'leave',
          evalExpr: false,
        }
      );
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
          runningWorkspaceId: this.appContext?.runningWorkspaceId || this.id,
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
    const triggeredInteraction = (<Prismeai.TriggeredInteraction>event).payload;
    if (
      event.type === EventType.TriggeredInteraction &&
      triggeredInteraction.trigger?.type == 'schedule'
    ) {
      const { appInstanceSlug, ...trigger } = triggeredInteraction.trigger;
      if (appInstanceSlug && appInstanceSlug in this.imports) {
        const nestedTriggeredInteraction = {
          ...triggeredInteraction,
          trigger,
        };
        return this.imports[appInstanceSlug].getEventTriggers({
          ...event,
          payload: nestedTriggeredInteraction,
        });
      }
      return this.triggers.schedules[trigger.value] || [];
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
        [slug]: `${API_URL}/workspaces/${workspaceId}/webhooks/${fullEndpointSlug}`,
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
      const automation = this.imports[appSlug].getAutomation(name, false);
      if (automation) {
        // For apps automation, fix runningWorkspaceId with current one
        automation.runningWorkspaceId =
          this.appContext?.runningWorkspaceId || this.id;
      }
      return automation;
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
      // Not initializing this would make permissions rule "authorizations.actions: { $exists: false } " fail when authorizations is undefined
      authorizations: {},
      ...automation,
      workspace: this,
      runningWorkspaceId: this.appContext?.runningWorkspaceId || this.id,
      secretPaths: automation.arguments
        ? findSecretPaths(automation.arguments)
        : [],
    };
  }
}
