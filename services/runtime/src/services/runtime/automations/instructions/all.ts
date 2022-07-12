import { Broker } from '@prisme.ai/broker';
import { runInstructions } from '..';
import { Logger } from '../../../../logger';
import { Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';
import { Cache } from '../../../../cache';

export async function all(
  all: Prismeai.All['all'],
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
  const promises = [];
  // Build promises sequentially to allow sequential execution of initial instructions (i.e a wait instruction followed by an emit)
  for (const instruction of all) {
    promises.push(
      runInstructions([instruction], { workspace, logger, broker, ctx, cache })
    );
  }

  return await Promise.allSettled(promises);
}
