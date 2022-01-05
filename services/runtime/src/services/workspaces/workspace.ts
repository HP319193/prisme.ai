export type AppName = string;
export type WorkflowName = string;
export type WorkflowReference = [AppName[], WorkflowName];

export type DetailedTrigger = Prismeai.Trigger & {
  name: string;
  automationId: string;
};
export interface Triggers {
  events: Record<string, DetailedTrigger[]>;
  endpoints: Record<string, DetailedTrigger[]>;
}

export type DetailedWorkflow = Prismeai.Workflow & {
  name: string;
  automationId: string;
  appName?: string;
};
export type Workflows = Record<WorkflowName, DetailedWorkflow[]>;

export class Workspace {
  private dsul: Prismeai.Workspace;
  public name: string;
  public id: string;
  private triggers: Triggers;
  private workflows: Workflows;

  constructor(workspace: Prismeai.Workspace) {
    this.name = workspace.name;
    this.id = workspace.id!!;
    this.triggers = { events: {}, endpoints: {} };
    this.workflows = {};

    this.dsul = workspace;
    this.update(workspace);
  }

  update(workspace: Prismeai.Workspace) {
    this.name = workspace.name;
    this.triggers = Object.values(workspace?.automations || {})
      .map(({ triggers, id }) =>
        Object.entries(triggers || {}).map(([name, cur]) => ({
          ...cur,
          automationId: id!!,
          name,
        }))
      )
      .flat()
      .reduce<Triggers>(
        (triggers, trigger) => {
          (trigger.events || []).forEach((cur) => {
            triggers.events[cur] = (triggers.events[cur] || []).concat([
              trigger,
            ]);
          });

          if (trigger.endpoint === true) {
            triggers.endpoints[trigger.automationId] = (
              triggers.endpoints[trigger.automationId] || []
            ).concat([trigger]);
          } else if (typeof trigger.endpoint === "string") {
            triggers.endpoints[trigger.endpoint] = (
              triggers.endpoints[trigger.endpoint] || []
            ).concat([trigger]);
          }

          return triggers;
        },
        { events: {}, endpoints: {} }
      );

    this.workflows = Object.values(workspace?.automations || {})
      .map(({ workflows, id }) =>
        Object.entries(workflows || {}).map(([name, cur]) => ({
          ...cur,
          automationId: id!!,
          name,
        }))
      )
      .flat()
      .reduce<Workflows>((workflows, workflow) => {
        const newWorkflows = (workflows[workflow.name] || []).concat([
          workflow,
        ]);
        return {
          ...workflows,
          [workflow.name]: newWorkflows,
        };
      }, {});

    this.dsul = workspace;
  }

  addOrReplaceAutomation(automation: Prismeai.Automation) {
    const newAutomations = (this.dsul.automations || [])
      .filter((cur) => cur.id !== automation.id)
      .concat([automation]);

    this.update({
      ...this.dsul,
      automations: newAutomations,
    });
  }

  deleteAutomation(automationId: string) {
    const newAutomations = (this.dsul.automations || []).filter(
      (cur) => cur.id !== automationId
    );

    this.update({
      ...this.dsul,
      automations: newAutomations,
    });
  }

  private parseWorkflowName(name: string): WorkflowReference {
    const appSeparatorIdx = name.lastIndexOf(".");
    return appSeparatorIdx !== -1
      ? [
          name.slice(0, appSeparatorIdx).split("."),
          name.slice(appSeparatorIdx + 1),
        ]
      : [[], name];
  }

  getEventTriggers(event: string) {
    return this.triggers.events[event];
  }

  getEndpointTriggers(slug: string) {
    return this.triggers.endpoints[slug];
  }

  getWorkflow(id: string) {
    const [apps, name] = this.parseWorkflowName(id);
    const matchingWorkflows = this.workflows[name];
    if (!matchingWorkflows) {
      return undefined;
    }
    const appsName = apps.join(".");
    return matchingWorkflows.find(
      (cur) => (!appsName && !cur.appName) || appsName == cur.appName
    );
  }
}
