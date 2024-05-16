import { Broker } from '@prisme.ai/broker';
import {
  InvalidInstructionError,
  ObjectNotFoundError,
} from '../../../../errors';
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
import { createUserTopic } from './createUserTopic';
import { joinUserTopic } from './joinUserTopic';
import { Cache } from '../../../../cache';
import { EventType } from '../../../../eda';

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
  Comment = 'comment',
  createUserTopic = 'createUserTopic',
  joinUserTopic = 'joinUserTopic',
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
    ctx.set((<any>payload).output, result, {
      emitErrors: {
        error: 'InvalidOutputError',
        message:
          "Cannot set instruction output, please make sure your instruction's output indicates a variable name as a string",
      },
    });
  }
}

export async function runInstruction(
  workspace: Workspace,
  instruction: Prismeai.Instruction,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker,
  cache: Cache,
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
  if (typeof payload === 'undefined' || payload == null) {
    throw new InvalidInstructionError(
      `Invalid ${instructionName} instruction : undefined or null payload`,
      {
        instructionName,
      }
    );
  }
  switch (instructionName) {
    case InstructionType.Emit:
      result = await emit(
        <Prismeai.Emit['emit']>payload,
        broker,
        ctx,
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
      result = await fetch(
        <Prismeai.Fetch['fetch']>payload,
        logger,
        ctx,
        broker
      );
      break;
    case InstructionType.Conditions:
      result = await conditions(<Prismeai.Conditions>payload, {
        workspace,
        logger,
        broker,
        ctx,
        cache,
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
        cache,
      });
      break;
    case InstructionType.All:
      result = await all(<Prismeai.All['all']>payload, {
        workspace,
        logger,
        broker,
        ctx,
        cache,
      });
      break;
    case InstructionType.Comment:
      break;
    case InstructionType.createUserTopic:
      result = await createUserTopic(
        <Prismeai.CreateUserTopic['createUserTopic']>payload,
        broker,
        ctx,
        cache,
        workspace.appContext
      );
      break;
    case InstructionType.joinUserTopic:
      result = await joinUserTopic(
        <Prismeai.JoinUserTopic['joinUserTopic']>payload,
        broker,
        ctx,
        cache,
        workspace.appContext
      );
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
    ctx.set((<any>payload).output, result, {
      emitErrors: {
        error: 'InvalidOutputError',
        message:
          "Cannot set instruction output, please make sure your instruction's output indicates a variable name as a string",
      },
    });
  }

  return true;
}
