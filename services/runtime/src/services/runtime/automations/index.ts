import { Broker } from '@prisme.ai/broker';
import { Cache } from '../../../cache';
import { EventType } from '../../../eda';
import { Logger } from '../../../logger';
import { interpolate } from '../../../utils';
import { DetailedAutomation, Workspace } from '../../workspaces';
import { ContextsManager } from '../contexts';
import { runInstruction, InstructionType, Break } from './instructions';
import { rateLimiter } from '../../rateLimits/rateLimiter';
import { validateArguments } from './validateArguments';

export async function executeAutomation(
  workspace: Workspace,
  automation: DetailedAutomation,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker,
  cache: Cache,
  rootAutomation?: boolean
) {
  if (automation.validateArguments && automation.arguments) {
    validateArguments(
      workspace.id,
      automation.slug!,
      ctx.payload,
      automation.arguments
    );
  }
  await ctx.securityChecks();
  await rateLimiter.workspace(workspace.id, ctx.system).executeAutomation(ctx);
  const startedAt = Date.now();

  let breakThisAutomation: false | Break = false,
    breakRaised = false;
  try {
    await runInstructions(automation.do, {
      workspace,
      ctx,
      logger,
      broker,
      cache,
    });
  } catch (error) {
    if (!(error instanceof Break)) {
      (<any>error).source = (<any>error).source || {
        ...broker.parentSource,
        automationSlug: automation.slug,
      };
      (<any>error).details = {
        ...(<any>error).details,
        payload: ctx.payload,
      };
      throw error;
    }
    breakRaised = true;
    if (error.scope === 'all' && !rootAutomation) {
      breakThisAutomation = error;
    }
  }

  const output = evaluateOutput(automation, ctx);
  delete ctx?.payload?.headers?.['authorization'];
  const { $http: __, ...automationPayload } = ctx.payload;
  broker.send<Prismeai.ExecutedAutomation['payload']>(
    EventType.ExecutedAutomation,
    {
      slug: automation.slug!,
      payload: automationPayload,
      output,
      duration: Date.now() - startedAt,
      throttled: ctx.throttled ? ctx.throttled : undefined,
      startedAt: new Date(startedAt).toISOString(),
      trigger: ctx.trigger!,
      break: breakRaised,
    },
    {
      userId: ctx?.user?.id,
      serviceTopic: EventType.ExecutedAutomation,
    },
    undefined,
    {
      exceedingSizeLimit: {
        // If execution event exceeds size limits, omit automation payload & output
        redact: ['payload', 'output'],
        replaceWith: null,
      },
    }
  );

  if (breakThisAutomation) {
    throw breakThisAutomation;
  }
  return output;
}

function evaluateOutput(automation: DetailedAutomation, ctx: ContextsManager) {
  return automation.output
    ? interpolate(automation.output, ctx.publicContexts)
    : {};
}

export async function runInstructions(
  instructions: Prismeai.Instruction[],
  {
    workspace,
    ctx,
    logger,
    broker,
    cache,
  }: {
    workspace: Workspace;
    ctx: ContextsManager;
    logger: Logger;
    broker: Broker;
    cache: Cache;
  }
) {
  for (let instruction of instructions || []) {
    const instructionName = Object.keys(instruction || {})[0];
    // Before each run, we interpolate the instruction to replace all the variables based on the context
    // Do not interpolate 'do' fields nor conditions as they include nested instruction lists
    const interpolatedInstruction = interpolateInstruction(
      instructionName,
      instruction,
      ctx.publicContexts
    );

    if (instructionName === InstructionType.Break) {
      const scope = (<any>interpolatedInstruction)[InstructionType.Break]
        ?.scope;
      throw new Break(scope);
    }

    await runInstruction(
      workspace,
      interpolatedInstruction,
      ctx,
      logger,
      broker,
      cache,
      async (nextAutomation, payload) => {
        const childBroker = broker.child({
          appSlug: nextAutomation.workspace.appContext?.appSlug,
          appInstanceFullSlug:
            nextAutomation.workspace.appContext?.appInstanceFullSlug,
          automationSlug: nextAutomation.slug,
          appInstanceDepth:
            nextAutomation.workspace.appContext?.parentAppSlugs?.length || 0,
        });
        const childCtx = await ctx.childAutomation(
          nextAutomation,
          payload,
          childBroker
        );
        return executeAutomation(
          nextAutomation.workspace,
          nextAutomation,
          childCtx,
          logger,
          childBroker,
          cache
        );
      }
    );
  }
}

function interpolateInstruction(
  instructionName: string,
  instruction: Prismeai.Instruction,
  ctx: any
) {
  const interpolationExclude: string[] = [];
  if (instructionName == InstructionType.Repeat) {
    interpolationExclude.push('do');
  } else if (instructionName == InstructionType.Conditions) {
    interpolationExclude.push('conditions');
  }
  return interpolate(instruction, ctx, { exclude: interpolationExclude });
}
