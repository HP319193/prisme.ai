import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../../eda";
import { ObjectNotFoundError } from "../../../errors";
import { Logger } from "../../../logger";
import { interpolate } from "../../../utils";
import { Workspace } from "../../workspaces";
import { ContextsManager } from "../contexts";
import { runInstruction } from "./instructions";

export async function executeAutomation(
  workspace: Workspace,
  automation: Prismeai.Automation,
  payload: object,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
) {
  ctx.run.payload = payload;
  await ctx.securityChecks();

  for (const instruction of automation.do) {
    // Before each run, we interpolate the instruction to replace all the variables based on the context
    const interpolatedInstruction = interpolate(
      instruction,
      ctx.publicContexts
    );

    const knownInstruction = await runInstruction(
      workspace,
      interpolatedInstruction,
      ctx,
      logger,
      broker
    );

    if (!knownInstruction) {
      const keys = Object.keys(interpolatedInstruction);
      if (!keys.length) {
        return;
      }
      const customAutomation = workspace.getAutomation(keys[0]);
      if (!customAutomation) {
        logger.trace({
          msg: `Did not find any automation matching '${keys[0]}'`,
        });
        broker.send(
          "error",
          new ObjectNotFoundError(`Automation not found`, {
            workspaceId: workspace.id,
            automation: keys[0],
          })
        );
        return;
      }
      await executeAutomation(
        workspace,
        customAutomation,
        (<any>interpolatedInstruction)[keys[0]],
        ctx,
        logger,
        broker
      );
    }
  }

  const output = evaluateOutput(automation, ctx);
  broker.send<Prismeai.ExecutedAutomation["payload"]>(
    EventType.ExecutedAutomation,
    {
      slug: automation.slug!,
      payload,
      output,
    }
  );
  return output;
}

function evaluateOutput(automation: Prismeai.Automation, ctx: ContextsManager) {
  return automation.output
    ? interpolate(automation.output, ctx.publicContexts)
    : "hardcoded output";
}
