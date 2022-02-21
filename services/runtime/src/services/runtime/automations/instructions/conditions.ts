import { Broker } from '@prisme.ai/broker';
import { Logger } from 'pino';
import { runInstructions } from '..';
import { evaluate } from '../../../../utils/evaluate';
import { Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

const getFirstTruthyCondition = (
  { default: defaultWorkflow, ...conditions }: Prismeai.Conditions,
  scope: { [x: string]: object }
) => {
  for (const condition in conditions) {
    if (evaluate(condition, scope)) {
      return conditions[condition];
    }
  }
  return defaultWorkflow;
};

export async function conditions(
  conditions: Prismeai.Conditions,
  {
    workspace,
    logger,
    broker,
    ctx,
  }: {
    workspace: Workspace;
    logger: Logger;
    broker: Broker;
    ctx: ContextsManager;
  }
) {
  const workflowToExecute = getFirstTruthyCondition(
    conditions,
    ctx.publicContexts
  );

  return runInstructions(workflowToExecute, { workspace, ctx, logger, broker });
}
