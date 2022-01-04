import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../../eda";
import { ObjectNotFoundError } from "../../../errors";
import { Logger } from "../../../logger";
import { DetailedWorkflow, Workspace } from "../../workspaces";
import { ContextsManager } from "../contexts";
import { runInstruction } from "./instructions";

export async function executeWorkflow(
  workspace: Workspace,
  workflow: DetailedWorkflow,
  payload: object,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
) {
  ctx.run.payload = payload;
  await ctx.securityChecks();

  for (const instruction of workflow.do) {
    const knownInstruction = await runInstruction(
      workspace,
      instruction,
      ctx,
      logger,
      broker
    );

    if (!knownInstruction) {
      const keys = Object.keys(instruction);
      if (!keys.length) {
        return;
      }
      const workflow = workspace.getWorkflow(keys[0]);
      if (!workflow) {
        logger.trace({
          msg: `Did not find any workflow matching '${keys[0]}'`,
        });
        broker.send(
          "error",
          new ObjectNotFoundError(`Workflow not found`, {
            workspaceId: workspace.id,
            workflow: keys[0],
          })
        );
        return;
      }
      await executeWorkflow(
        workspace,
        workflow,
        (<any>instruction)[keys[0]],
        ctx,
        logger,
        broker
      );
    }
  }

  const output = evaluateOutput(workflow, ctx);
  broker.send<Prismeai.ExecutedWorkflow["payload"]>(
    EventType.ExecutedWorkflow,
    {
      workflow: workflow.name,
      automation: workflow.automationId,
      payload,
      output,
    }
  );
  return output;
}

function evaluateOutput(workflow: Prismeai.Workflow, ctx: ContextsManager) {
  return workflow.output || "hardcoded output";
}
