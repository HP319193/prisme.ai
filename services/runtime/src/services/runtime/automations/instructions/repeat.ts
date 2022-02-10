import { Broker } from '@prisme.ai/broker';
import { Logger } from 'pino';
import { runInstructions } from '..';
import { Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

export const REPEAT_ITEM_VAR_NAME = 'item';
export async function repeat(
  { on, until, do: doInstructions }: Prismeai.Repeat['repeat'],
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
  const maxIterations =
    typeof until !== 'undefined' ? until : (<any>on)?.length || 0;
  for (let i = 0; i < maxIterations; i++) {
    ctx.set(REPEAT_ITEM_VAR_NAME, on?.length ? on[i] : i);
    await runInstructions(doInstructions, {
      workspace,
      ctx,
      logger,
      broker,
    });
  }
  ctx.delete(REPEAT_ITEM_VAR_NAME);
}
