import { Broker } from '@prisme.ai/broker';
import { ObjectNotFoundError } from '../../../../errors';
import { Logger } from '../../../../logger';
import { DetailedAutomation, Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';
import { conditions } from './conditions';
import { emit } from './emit';
import { fetch } from './fetch';
import { set } from './set';
import { deleteInstruction } from './deleteInstruction';
import { repeat } from './repeat';

export enum InstructionType {
  Emit = 'emit',
  Fetch = 'fetch',
  Conditions = 'conditions',
  Set = 'set',
  Delete = 'delete',
  Break = 'break',
  Repeat = 'repeat',
}

export async function runCustomAutomation(
  workspace: Workspace,
  instruction: any,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker,
  executeAutomation: (automation: DetailedAutomation, ctx: any) => Promise<void>
) {
  const automationName = Object.keys(instruction)[0];
  if (!automationName) {
    return;
  }
  const calledAutomation = workspace.getAutomation(automationName);
  if (!calledAutomation) {
    throw new ObjectNotFoundError(`Automation not found`, {
      workspaceId: workspace.id,
      automation: automationName,
    });
  }

  const payload = instruction[automationName] || {};
  const result = await executeAutomation(
    calledAutomation,
    // ctx
    ctx.child(
      {
        config: calledAutomation.workspace.config,
      },
      {
        // If we do not reinstantiate payload, writting to local context might mutate this payload (& produces output-related errors)
        payload: { ...payload },
        appContext: calledAutomation.workspace?.appContext,
      }
    )
  );
  if (typeof result !== 'undefined' && (<any>payload).output!!) {
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
    automation: DetailedAutomation,
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
      result = await emit(
        <Prismeai.Emit['emit']>payload,
        broker,
        workspace.appContext
      );
      break;
    case InstructionType.Fetch:
      result = await fetch(<Prismeai.Fetch['fetch']>payload, ctx);
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
      result = await set(<Prismeai.Set['set']>payload, ctx);
      break;
    case InstructionType.Delete:
      result = await deleteInstruction(<Prismeai.Delete['delete']>payload, ctx);
      break;
    case InstructionType.Repeat:
      result = await repeat(<Prismeai.Repeat['repeat']>payload, {
        workspace,
        logger,
        broker,
        ctx,
      });
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

  if (typeof result !== 'undefined' && (<any>payload).output!!) {
    ctx.set((<any>payload).output, result);
  }

  return true;
}
