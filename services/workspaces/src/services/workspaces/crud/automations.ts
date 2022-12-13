import { remove as removeDiacritics } from 'diacritics';
import { parseExpression as parseCron } from 'cron-parser';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import Workspaces from './workspaces';
import {
  AlreadyUsedError,
  InvalidScheduleError,
  InvalidSlugError,
  ObjectNotFoundError,
} from '../../../errors';
import { SLUG_VALIDATION_REGEXP } from '../../../../config';

class Automations {
  private broker: Broker;
  private workspaces: Workspaces;

  constructor(workspaces: Workspaces, broker: Broker) {
    this.broker = broker;
    this.workspaces = workspaces;
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
    workspace: Prismeai.Workspace,
    localizedName: Prismeai.LocalizedText
  ) {
    const name =
      typeof localizedName === 'object'
        ? localizedName[Object.keys(localizedName)[0]]
        : (localizedName as string);
    const base = removeDiacritics(name)
      .replace(/[^a-zA-Z0-9 _-]+/g, '')
      .trim()
      .slice(0, 20);
    let slug = base;
    let idx = -1;
    while (slug in (workspace.automations || {})) {
      idx++;
      slug = `${base}-${idx}`;
    }

    return slug;
  }

  createAutomation = async (
    workspaceId: string | Prismeai.Workspace,
    automation: Prismeai.Automation,
    automationSlug?: string
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;
    const slug =
      automationSlug || this.generateAutomationSlug(workspace, automation.name);
    if (!SLUG_VALIDATION_REGEXP.test(slug)) {
      throw new InvalidSlugError(slug);
    }

    if (automation.when?.schedules) {
      this.validateSchedules(automation.when?.schedules);
    }

    const updatedWorkspace = {
      ...workspace,
      automations: {
        ...workspace.automations,
        [slug]: automation,
      },
    };

    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.CreatedAutomation['payload']>(
      EventType.CreatedAutomation,
      {
        automation,
        slug,
      }
    );
    return { ...automation, slug };
  };

  getAutomation = async (workspaceId: string, automationSlug: string) => {
    const workspace = await this.workspaces.getWorkspace(workspaceId);
    const automation = (workspace.automations || {})[automationSlug];
    if (!automation) {
      throw new ObjectNotFoundError(
        `Could not find automation '${automationSlug}'`,
        { workspaceId, automationSlug }
      );
    }

    return automation;
  };

  updateAutomation = async (
    workspaceId: string | Prismeai.Workspace,
    automationSlug: string,
    automation: Prismeai.Automation
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    if (
      !workspace ||
      !workspace.automations ||
      !workspace.automations[automationSlug]
    ) {
      throw new ObjectNotFoundError(
        `Could not find automation '${automationSlug}'`,
        { workspaceId, automationSlug }
      );
    }

    if (automation.when?.schedules) {
      this.validateSchedules(automation.when?.schedules);
    }

    const updatedWorkspace = {
      ...workspace,
      automations: {
        ...workspace.automations,
        [automationSlug]: automation,
      },
    };

    let oldSlug;
    if (automation.slug && automation.slug !== automationSlug) {
      if (!SLUG_VALIDATION_REGEXP.test(automation.slug)) {
        throw new InvalidSlugError(automation.slug);
      }
      if (automation.slug in workspace.automations) {
        throw new AlreadyUsedError(
          `Automation slug '${automation.slug}' is already used by another automation of your workspace !`,
          { slug: 'AlreadyUsedError' }
        );
      }

      oldSlug = automationSlug;
      delete updatedWorkspace.automations[oldSlug];
      updatedWorkspace.automations[automation.slug] = automation;
    }

    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.UpdatedAutomation['payload']>(
      EventType.UpdatedAutomation,
      {
        automation,
        slug: automation.slug || automationSlug,
        oldSlug,
      }
    );
    return { ...automation, slug: automation.slug || automationSlug };
  };

  deleteAutomation = async (
    workspaceId: string | Prismeai.Workspace,
    automationSlug: PrismeaiAPI.DeleteAutomation.PathParameters['automationSlug']
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    if (
      !workspace ||
      !workspace.automations ||
      !workspace.automations[automationSlug]
    ) {
      throw new ObjectNotFoundError(
        `Could not find automation '${automationSlug}'`,
        { workspaceId, automationSlug }
      );
    }

    const { name: automationName } = workspace.automations[automationSlug];
    const newAutomations = { ...workspace.automations };
    delete newAutomations[automationSlug];
    const updatedWorkspace = {
      ...workspace,
      automations: newAutomations,
    };

    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.DeletedAutomation['payload']>(
      EventType.DeletedAutomation,
      {
        automation: {
          slug: automationSlug,
          name: automationName,
        },
      }
    );
    return { slug: automationSlug };
  };
}

export default Automations;
