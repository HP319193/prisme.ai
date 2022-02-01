import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../../eda";
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

  await runInstructions(automation.do, { workspace, ctx, logger, broker });

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

export async function runInstructions(
  instructions: Prismeai.Instruction[],
  {
    workspace,
    ctx,
    logger,
    broker,
  }: {
    workspace: Workspace;
    ctx: ContextsManager;
    logger: Logger;
    broker: Broker;
  }
) {
  for (const instruction of instructions || []) {
    // Before each run, we interpolate the instruction to replace all the variables based on the context
    const interpolatedInstruction = interpolate(
      instruction,
      ctx.publicContexts
    );

    await runInstruction(
      workspace,
      interpolatedInstruction,
      ctx,
      logger,
      broker,
      (nextAutomation, nextCtx = ctx) => {
        return executeAutomation(
          workspace,
          nextAutomation,
          nextCtx,
          logger,
          broker
        );
      }
    );
  }
}
