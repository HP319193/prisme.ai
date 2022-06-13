import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { Logger } from '../../../logger';
import { interpolate } from '../../../utils';
import { DetailedAutomation, Workspace } from '../../workspaces';
import { ContextsManager } from '../contexts';
import { runInstruction, InstructionType, Break } from './instructions';

export async function executeAutomation(
  workspace: Workspace,
  automation: DetailedAutomation,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker,
  rootAutomation?: boolean
) {
  await ctx.securityChecks();
  const startedAt = Date.now();

  let breakThisAutomation: false | Break = false;
  try {
    await runInstructions(automation.do, { workspace, ctx, logger, broker });
  } catch (error) {
    if (!(error instanceof Break)) {
      (<any>error).source = (<any>error).source || {
        ...broker.parentSource,
        automationSlug: automation.slug,
      };
      throw error;
    }
    if (error.scope === 'all' && !rootAutomation) {
      breakThisAutomation = error;
    }
  }

  const output = evaluateOutput(automation, ctx);
  broker.send<Prismeai.ExecutedAutomation['payload']>(
    EventType.ExecutedAutomation,
    {
      slug: automation.slug!,
      payload: ctx.payload,
      output,
      duration: Date.now() - startedAt,
    },
    {},
    EventType.ExecutedAutomation
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
  }: {
    workspace: Workspace;
    ctx: ContextsManager;
    logger: Logger;
    broker: Broker;
  }
) {
  for (let instruction of instructions || []) {
    const instructionName = Object.keys(instruction || {})[0];
    // Before each run, we interpolate the instruction to replace all the variables based on the context
    const interpolatedInstruction = interpolate(
      instruction,
      ctx.publicContexts,
      ['do', 'conditions'] // Do not interpolate 'do' fields nor conditions as they include nested instruction lists
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
      (nextAutomation, payload) => {
        const childBroker = broker.child({
          appSlug: nextAutomation.workspace.appContext?.appSlug,
          appInstanceFullSlug:
            nextAutomation.workspace.appContext?.appInstanceFullSlug,
          automationSlug: nextAutomation.slug,
          appInstanceDepth:
            nextAutomation.workspace.appContext?.parentAppSlugs?.length || 0,
        });
        const childCtx = ctx.childAutomation(
          nextAutomation,
          payload,
          childBroker
        );
        return executeAutomation(
          nextAutomation.workspace,
          nextAutomation,
          childCtx,
          logger,
          childBroker
        );
      }
    );
  }
}
