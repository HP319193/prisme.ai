import { remove as removeDiacritics } from 'diacritics';
import { parseExpression as parseCron } from 'cron-parser';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { InvalidScheduleError } from '../../../errors';
import { hri } from 'human-readable-ids';
import { DSULType, DSULStorage } from '../../DSULStorage';
import { AccessManager, ActionType, SubjectType } from '../../../permissions';

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

  private generateAutomationSlug(localizedName?: Prismeai.LocalizedText) {
    if (!localizedName) {
      return hri.random();
    }
    const name =
      typeof localizedName === 'object'
        ? localizedName[Object.keys(localizedName)[0]]
        : (localizedName as string);
    return removeDiacritics(name)
      .replace(/[^a-zA-Z0-9 _-]+/g, '')
      .trim()
      .slice(0, 20);
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
    const slug =
      automation.slug || this.generateAutomationSlug(automation.name);

    if (automation.when?.schedules) {
      this.validateSchedules(automation.when?.schedules);
    }
    await this.storage.save({ workspaceId, slug }, automation, {
      mode: replace ? 'replace' : 'create',
      updatedBy: this.accessManager.user?.id,
    });

    this.broker.send<Prismeai.CreatedAutomation['payload']>(
      EventType.CreatedAutomation,
      {
        automation,
        slug,
      }
    );
    return { ...automation, slug };
  };

  getAutomation = async (workspaceId: string, slug: string) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Read,
      SubjectType.Workspace,
      workspaceId
    );
    const automation = await this.storage.get({ workspaceId, slug });
    return automation;
  };

  updateAutomation = async (
    workspaceId: string,
    slug: string,
    automation: Prismeai.Automation
  ) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );
    if (automation.when?.schedules) {
      this.validateSchedules(automation.when?.schedules);
    }
    await this.storage.save({ workspaceId, slug }, automation, {
      mode: 'update',
      updatedBy: this.accessManager.user?.id,
    });
    this.broker.send<Prismeai.UpdatedAutomation['payload']>(
      EventType.UpdatedAutomation,
      {
        automation,
        slug: automation.slug || slug,
        oldSlug: automation.slug && automation.slug !== slug ? slug : undefined,
      }
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
      }
    );
    return { slug: slug };
  };
}

export default Automations;
