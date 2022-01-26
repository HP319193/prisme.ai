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
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
) {
  await ctx.securityChecks();

  for (const instruction of automation.do || []) {
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
      const automationName = Object.keys(interpolatedInstruction)[0];
      if (!automationName) {
        return;
      }
      const calledAutomation = workspace.getAutomation(automationName);
      if (!calledAutomation) {
        logger.trace({
          msg: `Did not find any automation matching '${automationName}'`,
        });
        broker.send(
          "error",
          new ObjectNotFoundError(`Automation not found`, {
            workspaceId: workspace.id,
            automation: automationName,
          })
        );
        return;
      }

      const payload = interpolatedInstruction[automationName] || {};
      const result = await executeAutomation(
        workspace,
        calledAutomation,
        ctx.child({ payload }),
        logger,
        broker
      );
      if (typeof result !== "undefined" && (<any>payload).output!!) {
        ctx.set((<any>payload).output, result);
      }
    }
  }

  await ctx.save(); // TODO only save updated contexts (avoid making N unecessary redis requests at each automation end)
  const output = evaluateOutput(automation, ctx);
  broker.send<Prismeai.ExecutedAutomation["payload"]>(
    EventType.ExecutedAutomation,
    {
      slug: automation.slug!,
      payload: ctx.payload,
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
