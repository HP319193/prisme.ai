import { Broker, PrismeEvent } from "@prisme.ai/broker";
import { EventType } from "../../eda";
import { Logger } from "../../logger";
import { DetailedTrigger, Workspace } from "../workspaces";
import { ContextsManager } from "./contexts";
import { executeWorkflow } from "./workflows";

export default async function processEvent(
  workspace: Workspace,
  event: PrismeEvent,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
) {
  async function parseEvent(event: PrismeEvent): Promise<{
    trigger: DetailedTrigger;
    payload: any;
  }> {
    if (event.type === EventType.TriggeredWebhook) {
      const { automationId, payload } = (<Prismeai.TriggeredWebhook>event)
        .payload;
      return {
        trigger: workspace.getEndpointTrigger(automationId),
        payload,
      };
    }

    return {
      trigger: workspace.getEventTrigger(event.type),
      payload: event.payload,
    };
  }

  const { trigger, payload } = await parseEvent(event);
  if (!trigger) {
    logger.info("Did not find any matching trigger");
    return;
  }
  const workflow = workspace.getWorkflow(trigger.do);
  if (!workflow) {
    logger.info(
      `Did not find any matching workflow '${trigger.do}' for trigger '${trigger.name})`
    );
    return;
  }
  return await executeWorkflow(
    workspace,
    workflow,
    payload,
    ctx,
    logger,
    broker
  );
}
