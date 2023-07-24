import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { Apps } from '../apps';
import { Scheduler } from './scheduler';
import { TriggeredSchedule } from './types';

// This is the main Schedules service
// It's role is to manage the schedules defined in DSUL.
// For this, it will perform :
// - Schedule creation
// - Schedule renaming (automation slug changed)
// Dependencies : Broker, Storage, Redis, Apps

export class Schedules {
  private broker: Broker;
  private scheduler: Scheduler;
  private apps: Apps;

  constructor(broker: Broker, apps: Apps) {
    this.broker = broker;
    this.scheduler = new Scheduler({
      success: this.scheduleSuccess.bind(this),
      error: this.scheduleError.bind(this),
    });
    this.apps = apps;
  }

  async scheduleSuccess(data: TriggeredSchedule) {
    const triggeredInteraction: Prismeai.TriggeredInteraction['payload'] = {
      workspaceId: data.workspaceId,
      automation: data.automationSlug,
      trigger: {
        type: 'schedule',
        value: data.schedule,
      },
      startedAt: new Date().toISOString(),
    };

    const appInstanceSeparator = triggeredInteraction.automation.indexOf('.');
    if (appInstanceSeparator != -1) {
      triggeredInteraction.trigger.appInstanceSlug =
        triggeredInteraction.automation.slice(0, appInstanceSeparator);
      triggeredInteraction.automation = triggeredInteraction.automation.slice(
        appInstanceSeparator + 1
      );
    }

    await this.broker.send<Prismeai.TriggeredInteraction['payload']>(
      EventType.TriggeredInteraction,
      triggeredInteraction,
      { workspaceId: data.workspaceId }
    );
  }

  async scheduleError({
    message,
    details,
    workspaceId,
  }: Prismeai.GenericErrorEvent['payload']) {
    await this.broker.send<Prismeai.GenericErrorEvent['payload']>(
      EventType.Error,
      {
        type: 'scheduleFailed',
        message,
        details,
      },
      { workspaceId }
    );
  }

  start() {
    const listenedEvents = [
      EventType.DeletedWorkspace,

      EventType.CreatedAutomation,
      EventType.UpdatedAutomation,
      EventType.DeletedAutomation,

      EventType.InstalledApp,
      EventType.ConfiguredApp,
      EventType.UninstalledApp,
    ];

    this.broker.on(listenedEvents, async (event, broker, { logger }) => {
      const workspaceId = event.source.workspaceId;
      if (!workspaceId) {
        return true;
      }

      logger.info({
        msg: 'Received updated schedules',
        event,
      });
      switch (event.type) {
        // Workspace automations
        case EventType.CreatedAutomation:
        case EventType.UpdatedAutomation:
          const {
            payload: {
              automation,
              slug: automationSlug,
              oldSlug: automationOldSlug,
            },
          } = event as any as Prismeai.UpdatedAutomation;
          await this.scheduleAutomation(
            workspaceId,
            { ...automation, slug: automationSlug },
            automationOldSlug
          );
          break;

        case EventType.DeletedAutomation:
          const deletedAutomationSlug = (
            event as any as Prismeai.DeletedAutomation
          ).payload.automationSlug;
          await this.unscheduleAutomation(workspaceId, deletedAutomationSlug);
          break;

        // App instances
        case EventType.InstalledApp:
        case EventType.ConfiguredApp:
          const {
            payload: {
              appInstance,
              slug: appInstanceSlug,
              oldSlug: appInstanceOldSlug,
            },
          } = event as any as Prismeai.ConfiguredAppInstance;
          await this.scheduleAppInstance(
            workspaceId,
            { ...appInstance, slug: appInstanceSlug },
            appInstanceOldSlug
          );
          break;

        case EventType.UninstalledApp:
          const uninstalledAppInstanceSlug = (
            event as any as Prismeai.UninstalledAppInstance
          )?.payload?.slug;
          await this.unscheduleAppInstance(
            workspaceId,
            uninstalledAppInstanceSlug
          );
          break;

        // Workspace deletion
        case EventType.DeletedWorkspace:
          this.scheduler.delete(workspaceId);
          break;
      }
      return true;
    });
  }

  async close() {
    return await this.scheduler.close();
  }

  private async scheduleAutomation(
    workspaceId: string,
    automation: Prismeai.Automation,
    oldSlug?: string
  ) {
    const slug = automation.slug!;
    const schedules = automation?.when?.schedules || [];
    if (oldSlug) {
      this.scheduler.delete(workspaceId, oldSlug);
    } else if (automation.disabled || !schedules.length) {
      this.scheduler.delete(workspaceId, slug);
      return;
    }

    // Launch cron if there is a trigger
    if (schedules?.length) {
      const launched = await this.scheduler.launch(
        workspaceId,
        slug,
        schedules
      );
      await this.broker.send(
        EventType.ScheduledAutomation,
        {
          slug,
          schedules,
          details: {
            launched,
          },
        },
        { workspaceId, automationSlug: slug }
      );
    }
  }

  private async unscheduleAutomation(
    workspaceId: string,
    automationSlug: string
  ) {
    this.scheduler.delete(workspaceId, automationSlug);
  }

  private async scheduleAppInstance(
    workspaceId: string,
    appInstance: Prismeai.AppInstance,
    oldSlug?: string
  ) {
    const slug = appInstance.slug!;
    if (oldSlug) {
      this.scheduler.delete(workspaceId, oldSlug);
    }
    const app = await this.apps.getApp(
      appInstance?.appSlug,
      appInstance?.appVersion
    );
    const schedules = Object.entries(app.automations || {})
      .map(([automationSlug, automation]) => {
        if (
          automation.private ||
          automation.disabled ||
          !automation?.when?.schedules?.length
        ) {
          return false;
        }

        return {
          slug: `${slug}.${automationSlug}`,
          schedules: automation.when.schedules,
        };
      })
      .filter<{ slug: string; schedules: string[] }>(Boolean as any);
    await Promise.all(
      schedules.map(({ slug, schedules }) =>
        this.scheduler.launch(workspaceId, slug, schedules)
      )
    );
  }

  private async unscheduleAppInstance(
    workspaceId: string,
    appInstanceSlug: string
  ) {
    const slug = `${appInstanceSlug}.*`;
    this.scheduler.delete(workspaceId, slug);
  }
}
