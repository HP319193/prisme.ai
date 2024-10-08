import { remove as removeDiacritics } from 'diacritics';
import { parseExpression as parseCron } from 'cron-parser';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { InvalidScheduleError } from '../../../errors';
// @ts-ignore
import { hri } from 'human-readable-ids';
import { DSULType, DSULStorage } from '../../DSULStorage';
import { AccessManager, ActionType, SubjectType } from '../../../permissions';
import { extractAutomationEvents } from '../../../utils/extractEvents';

class Automations {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage<DSULType.Automations>;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    workspacesStorage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = workspacesStorage.child(DSULType.Automations);
  }

  private validateSchedules(schedules: Prismeai.When['schedules'] = []) {
    for (const schedule of schedules) {
      try {
        // Only verify if it is a well formatted cron
        parseCron(schedule);
      } catch (e) {
        throw new InvalidScheduleError(undefined, e);
      }
    }
  }

  private generateAutomationSlug(
    localizedName?: Prismeai.LocalizedText,
    existingAutomations?: Prismeai.DSULReadOnly['automations']
  ) {
    if (!localizedName) {
      return hri.random();
    }
    const name =
      typeof localizedName === 'object'
        ? localizedName[Object.keys(localizedName)[0]]
        : (localizedName as string);
    const generate = (counter?: number) =>
      removeDiacritics(counter ? `${name}-${counter}` : name)
        .replace(/[^a-zA-Z0-9 _-]+/g, '')
        .trim()
        .slice(0, 20);
    let slug = generate();
    let counter = 0;
    do {
      slug = generate(++counter);
    } while (
      existingAutomations &&
      slug in existingAutomations &&
      counter < 100
    );
    return slug;
  }

  async getProcessedEvents(
    workspaceId: string,
    automation: Prismeai.Automation
  ) {
    let config = {};
    try {
      const workspace = await this.storage.get({
        workspaceId,
        dsulType: DSULType.DSULIndex,
      });
      config = workspace?.config?.value || {};
    } catch {}
    return extractAutomationEvents(automation, config);
  }

  createAutomation = async (
    workspaceId: string,
    automation: Prismeai.Automation,
    replace: boolean = false // Force update if it already exists
  ) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );
    let existingAutomations: Prismeai.DSULReadOnly['automations'] = {};
    try {
      const automationsIndex = await this.storage.folderIndex({
        dsulType: DSULType.AutomationsIndex,
        workspaceId,
      });
      if (automationsIndex) {
        existingAutomations = automationsIndex;
      }
    } catch {}
    const slug =
      automation.slug ||
      (await this.generateAutomationSlug(automation.name, existingAutomations));

    if (automation.when?.schedules) {
      this.validateSchedules(automation.when?.schedules);
    }
    const events = await this.getProcessedEvents(workspaceId, automation);

    // Default values
    if (typeof automation.validateArguments === 'undefined') {
      automation.validateArguments = true;
    }

    await this.storage.save({ workspaceId, slug }, automation, {
      mode: replace ? 'replace' : 'create',
      updatedBy: this.accessManager.user?.id,
      additionalIndexFields: { events },
    });

    // For legacy migration, do not emit this event as it might reset existing apps config
    if (!replace) {
      this.broker.send<Prismeai.CreatedAutomation['payload']>(
        EventType.CreatedAutomation,
        {
          automation,
          slug,
          events,
        },
        { workspaceId }
      );
    }
    return { ...automation, slug };
  };

  getAutomation = async (workspaceId: string, slug: string) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Read,
      SubjectType.Workspace,
      workspaceId
    );
    const automation = await this.storage.get({ workspaceId, slug });
    return { ...automation, slug };
  };

  updateAutomation = async (
    workspaceId: string,
    slug: string,
    automation: Prismeai.Automation,
    opts?: {
      upsert?: boolean;
    }
  ) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );
    if (automation.when?.schedules) {
      this.validateSchedules(automation.when?.schedules);
    }
    const events = await this.getProcessedEvents(workspaceId, automation);

    await this.storage.save({ workspaceId, slug }, automation, {
      mode: opts?.upsert ? 'replace' : 'update',
      updatedBy: this.accessManager.user?.id,
      additionalIndexFields: { events },
    });
    this.broker.send<Prismeai.UpdatedAutomation['payload']>(
      EventType.UpdatedAutomation,
      {
        automation,
        slug: automation.slug || slug,
        oldSlug: automation.slug && automation.slug !== slug ? slug : undefined,
        events,
      },
      { workspaceId }
    );
    return { ...automation, slug: automation.slug || slug };
  };

  deleteAutomation = async (workspaceId: string, slug: string) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );

    await this.storage.delete({ workspaceId, slug });

    this.broker.send<Prismeai.DeletedAutomation['payload']>(
      EventType.DeletedAutomation,
      {
        automationSlug: slug,
      },
      { workspaceId }
    );
    return { slug: slug };
  };
}

export default Automations;
