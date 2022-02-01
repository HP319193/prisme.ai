import { Broker } from "@prisme.ai/broker";
import { ObjectNotFoundError } from "../../../../errors";
import { Logger } from "../../../../logger";
import { Workspace } from "../../../workspaces";
import { ContextsManager } from "../../contexts";
import { conditions } from "./conditions";
import { emit } from "./emit";
import { fetch } from "./fetch";
import { set } from "./set";
import { deleteInstruction } from "./deleteInstruction";

export enum InstructionType {
  Emit = "emit",
  Fetch = "fetch",
  Conditions = "conditions",
  Set = "set",
  Delete = "delete",
}

export async function runCustomAutomation(
  workspace: Workspace,
  instruction: any,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker,
  executeAutomation: (
    automation: Prismeai.Automation,
    ctx: any
  ) => Promise<void>
) {
  const automationName = Object.keys(instruction)[0];
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

  const payload = instruction[automationName] || {};
  const result = await executeAutomation(
    calledAutomation,
    ctx.child({ payload })
  );
  if (typeof result !== "undefined" && (<any>payload).output!!) {
    ctx.set((<any>payload).output, result);
  }
}

export async function runInstruction(
  workspace: Workspace,
  instruction: Prismeai.Instruction,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker,
  executeAutomation: (
    automation: Prismeai.Automation,
    context?: any
  ) => Promise<void>
) {
  let result;

  const instructionName = Object.keys(instruction || {})[0];
  if (!instructionName) {
    return true;
  }
  const payload = (<any>instruction)[instructionName] as Prismeai.Instruction;
  switch (instructionName) {
    case InstructionType.Emit:
      result = await emit(<Prismeai.Emit["emit"]>payload, broker);
      break;
    case InstructionType.Fetch:
      result = await fetch(<Prismeai.Fetch["fetch"]>payload, ctx);
      break;
    case InstructionType.Conditions:
      result = await conditions(<Prismeai.Conditions>payload, {
        workspace,
        logger,
        broker,
        ctx,
      });
      break;
    case InstructionType.Set:
      result = await set(<Prismeai.Set["set"]>payload, ctx);
      break;
    case InstructionType.Delete:
      result = await deleteInstruction(<Prismeai.Delete["delete"]>payload, ctx);
      break;
    default:
      result = await runCustomAutomation(
        workspace,
        instruction,
        ctx,
        logger,
        broker,
        executeAutomation
      );
  }

  if (typeof result !== "undefined" && (<any>payload).output!!) {
    ctx.set((<any>payload).output, result);
  }

  return true;
}
