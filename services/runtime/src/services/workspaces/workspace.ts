export type DetailedTrigger = Prismeai.Trigger & {
  automationSlug: string;
};
type EventName = string;
type EndpointName = string;
export interface Triggers {
  events: Record<EventName, DetailedTrigger[]>;
  endpoints: Record<EndpointName, DetailedTrigger[]>;
}

export class Workspace {
  private dsul: Prismeai.Workspace;
  public name: string;
  public id: string;
  private triggers: Triggers;

  constructor(workspace: Prismeai.Workspace) {
    this.name = workspace.name;
    this.id = workspace.id!!;
    this.triggers = { events: {}, endpoints: {} };

    this.dsul = workspace;
    this.update(workspace);
  }

  update(workspace: Prismeai.Workspace) {
    this.name = workspace.name;

    const { automations = {} } = workspace;
    this.triggers = Object.keys(automations).reduce(
      (prev, key) => {
        const automation = automations[key];
        const { trigger, trigger: { events, endpoint } = {} } = automation;
        if (!trigger) return prev;
        if (events) {
          events.forEach((event) => {
            prev.events[event] = [
              ...(prev.events[event] || []),
              {
                ...trigger,
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
              ...trigger,
              automationSlug: key,
            },
          ];
        }
        return prev;
      },
      { events: {}, endpoints: {} } as Triggers
    );

    this.dsul = workspace;
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

  getAutomation(slug: string) {
    const automation = (this.dsul.automations || {})[slug];

    if (!automation) return null;

    return {
      slug,
      ...automation,
    };
  }
}
