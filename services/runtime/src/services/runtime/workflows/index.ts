import { Broker } from "@prisme.ai/broker";
import { Logger } from "../../../logger";
import { Workspace } from "../../workspaces";
import { ContextsManager } from "../contexts";
import { runInstruction } from "./instructions";

export async function executeWorkflow(
  workspace: Workspace,
  workflow: Prismeai.Workflow,
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
        logger.warn({
          msg: `Did not find any workflow matching '${keys[0]}'`,
        });
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
}
