import { remove as removeDiacritics } from 'diacritics';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import Workspaces from './workspaces';
import DSULStorage from '../DSULStorage';
import { AlreadyUsedError, ObjectNotFoundError } from '../../../errors';

class Automations {
  private broker: Broker;
  private storage: DSULStorage;
  private workspaces: Workspaces;

  constructor(broker: Broker, storage: DSULStorage, workspaces: Workspaces) {
    this.broker = broker;
    this.storage = storage;
    this.workspaces = workspaces;
  }

  private generateAutomationSlug(
    workspace: Prismeai.Workspace,
    automationName: string
  ) {
    const base = removeDiacritics(automationName)
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
    workspaceId: string,
    automation: Prismeai.Automation
  ) => {
    const workspace = await this.workspaces.getWorkspace(workspaceId);
    const slug = this.generateAutomationSlug(workspace, automation.name);

    const updatedWorkspace = {
      ...workspace,
      automations: {
        ...workspace.automations,
        [slug]: automation,
      },
    };

    await this.workspaces.updateWorkspace(workspaceId, updatedWorkspace);

    this.broker
      .send<Prismeai.CreatedAutomation['payload']>(
        EventType.CreatedAutomation,
        {
          automation,
          slug,
        }
      )
      .catch(console.error);
    return { ...automation, slug };
  };

  getAutomation = async (workspaceId: string, automationSlug: string) => {
    const workspace = await this.storage.get(workspaceId);
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
    workspaceId: string,
    automationSlug: string,
    automation: Prismeai.Automation
  ) => {
    const workspace = await this.storage.get(workspaceId);

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

    const updatedWorkspace = {
      ...workspace,
      automations: {
        ...workspace.automations,
        [automationSlug]: automation,
      },
    };

    let oldSlug;
    if (automation.slug && automation.slug !== automationSlug) {
      if (automation.slug in workspace.automations) {
        throw new AlreadyUsedError(
          `Automation slug '${automation.slug}' is already used by another automation of your workspace !`
        );
      }

      oldSlug = automationSlug;
      delete updatedWorkspace.automations[oldSlug];
      updatedWorkspace.automations[automation.slug] = automation;
    }

    await this.workspaces.updateWorkspace(workspaceId, updatedWorkspace);

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
    workspaceId: string,
    automationSlug: PrismeaiAPI.DeleteAutomation.PathParameters['automationSlug']
  ) => {
    const workspace = await this.storage.get(workspaceId);

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

    const newAutomations = { ...workspace.automations };
    delete newAutomations[automationSlug];
    const updatedWorkspace = {
      ...workspace,
      automations: newAutomations,
    };

    await this.storage.save(workspaceId, updatedWorkspace);

    this.broker.send<Prismeai.DeletedAutomation['payload']>(
      EventType.DeletedAutomation,
      {
        automation: {
          slug: automationSlug,
          name: workspace.name,
        },
      }
    );
    return { slug: automationSlug };
  };
}

export default Automations;
