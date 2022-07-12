import { Broker } from '@prisme.ai/broker';
import { Logger } from 'pino';
import { runInstructions } from '..';
import { evaluate } from '../../../../utils/evaluate';
import { Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';
import { Cache } from '../../../../cache';

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
    cache,
  }: {
    workspace: Workspace;
    logger: Logger;
    broker: Broker;
    ctx: ContextsManager;
    cache: Cache;
  }
) {
  const workflowToExecute = getFirstTruthyCondition(
    conditions,
    ctx.publicContexts
  );
  if (!workflowToExecute) {
    return;
  }
  return runInstructions(workflowToExecute, {
    workspace,
    ctx,
    logger,
    broker,
    cache,
  });
}
