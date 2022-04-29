import { Broker } from '@prisme.ai/broker';
import { ObjectNotFoundError } from '../../../../errors';
import { Logger } from '../../../../logger';
import { DetailedAutomation, Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';
import { conditions } from './conditions';
import { emit } from './emit';
import { wait } from './wait';
import { fetch } from './fetch';
import { set } from './set';
import { deleteInstruction } from './deleteInstruction';
import { repeat } from './repeat';
import { all } from './all';

export class Break {
  constructor(public scope: Prismeai.Break['break']['scope'] = 'automation') {
    this.scope = scope;
  }
}

export enum InstructionType {
  Emit = 'emit',
  Fetch = 'fetch',
  Conditions = 'conditions',
  Set = 'set',
  Delete = 'delete',
  Break = 'break',
  Wait = 'wait',
  Repeat = 'repeat',
  All = 'all',
}

export async function runCustomAutomation(
  workspace: Workspace,
  instruction: any,
  ctx: ContextsManager,
  executeAutomation: (
    automation: DetailedAutomation,
    payload: any
  ) => Promise<void>
) {
  const automationSlug = Object.keys(instruction)[0];
  if (!automationSlug) {
    return;
  }
  const calledAutomation = workspace.getAutomation(automationSlug);
  if (!calledAutomation) {
    throw new ObjectNotFoundError(`Automation not found`, {
      workspaceId: workspace.id,
      automation: automationSlug,
    });
  }

  const payload = instruction[automationSlug] || {};
  const result = await executeAutomation(calledAutomation, payload);
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
    case InstructionType.Wait:
      result = await wait(
        <Prismeai.Wait['wait']>payload,
        broker,
        ctx,
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
    case InstructionType.All:
      result = await all(<Prismeai.All['all']>payload, {
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
        executeAutomation
      );
  }

  if (typeof result !== 'undefined' && (<any>payload).output!!) {
    ctx.set((<any>payload).output, result);
  }

  return true;
}
