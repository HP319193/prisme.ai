import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { Logger } from '../../../logger';
import { interpolate } from '../../../utils';
import { DetailedAutomation, Workspace } from '../../workspaces';
import { ContextsManager } from '../contexts';
import { runInstruction, InstructionType } from './instructions';

class Break {}

export async function executeAutomation(
  workspace: Workspace,
  automation: DetailedAutomation,
  ctx: ContextsManager,
  logger: Logger,
  broker: Broker
) {
  await ctx.securityChecks();
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
  }

  const output = evaluateOutput(automation, ctx);
  broker.send<Prismeai.ExecutedAutomation['payload']>(
    EventType.ExecutedAutomation,
    {
      slug: automation.slug!,
      payload: ctx.payload,
      output,
    }
  );
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
    if (instructionName === InstructionType.Break) {
      throw new Break();
    }

    // Before each run, we interpolate the instruction to replace all the variables based on the context
    const interpolatedInstruction = (<any>instruction).conditions
      ? instruction
      : interpolate(
          instruction,
          ctx.publicContexts,
          ['do'] // Do not interpolate 'do' fields as they include nested instruction lists
        );

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
        const childCtx = ctx.child(
          {
            config: nextAutomation.workspace.config,
          },
          {
            // If we do not reinstantiate payload, writting to local context might mutate this payload (& produces output-related errors)
            payload: { ...payload },
            appContext: nextAutomation.workspace?.appContext,
            broker: childBroker,
            automationSlug: nextAutomation.slug!,
          }
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
