import { Broker } from "@prisme.ai/broker";
import { Logger } from "../../../../logger";
import { Workspace } from "../../../workspaces";
import { Contexts } from "../../contexts";
import { emit } from "./emit";

export enum InstructionType {
  Emit = "emit",
}

export async function runInstruction(
  workspace: Workspace,
  instruction: Prismeai.Instruction,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
) {
  if (InstructionType.Emit in instruction) {
    await emit(<Prismeai.Emit>instruction, broker);
    return true;
  }

  return false;
}
