import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { Scheduler } from './scheduler';

// This is the main Schedules service
// It's role is to manage the schedules defined in DSUL.
// For this, it will perform :
// - Schedule creation
// - Schedule renaming (automation slug changed)
// Dependencies : Broker, Storage, Redis

export class Schedules {
  private broker: Broker;
  private scheduler: Scheduler;

  constructor(broker: Broker) {
    this.broker = broker;
    this.scheduler = new Scheduler({
      success: this.scheduleSuccess.bind(this),
      error: this.scheduleError.bind(this),
    });
  }

  async scheduleSuccess(data: Prismeai.TriggeredSchedule['payload']) {
    await this.broker.send<Prismeai.TriggeredSchedule['payload']>(
      EventType.TriggeredSchedule,
      {
        workspaceId: data.workspaceId,
        automationSlug: data.automationSlug,
        schedule: data.schedule,
      },
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
    ];

    this.broker.on(listenedEvents, async (event, broker, { logger }) => {
      const workspaceId = event.source.workspaceId;
      if (!workspaceId) {
        return true;
      }

      logger.info({
        msg: 'Received an updated automation',
        event,
      });
      switch (event.type) {
        case EventType.CreatedAutomation:
        case EventType.UpdatedAutomation:
          const {
            payload: {
              automation: { when: { schedules } = {} } = {},
              slug,
              oldSlug,
            },
          } = event as any as Prismeai.UpdatedAutomation;
          // Launch cron if there is a trigger
          if (schedules) {
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
          if (oldSlug) {
            this.scheduler.delete(workspaceId, oldSlug);
          }
          break;
        case EventType.DeletedAutomation:
          // Delete specific schedule
          const deletedAutomation = (event as any as Prismeai.DeletedAutomation)
            .payload.automation;

          this.scheduler.delete(workspaceId, deletedAutomation.slug);
          break;
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
}
