import { Broker } from "@prisme.ai/broker";
import { Logger } from "../../../../logger";
import { Workspace } from "../../../workspaces";
import { ContextsManager } from "../../contexts";
import { emit } from "./emit";
import { fetch } from "./fetch";

export enum InstructionType {
  Emit = "emit",
  Fetch = "fetch",
}

export async function runInstruction(
  workspace: Workspace,
  instruction: Prismeai.Instruction,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
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
    default:
      return false;
  }

  if (typeof result !== "undefined" && (<any>payload).output!!) {
    ctx.set((<any>payload).output, result);
  }

  return true;
}
