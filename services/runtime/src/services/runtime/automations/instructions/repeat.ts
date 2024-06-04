import { Broker } from '@prisme.ai/broker';
import { Logger } from 'pino';
import { runInstructions } from '..';
import { Cache } from '../../../../cache';
import { Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';
import { Readable } from 'stream';
import { rateLimiter } from '../../../rateLimits/rateLimiter';

type RepeatOn = Extract<Prismeai.Repeat['repeat'], { on: string }>;
type RepeatUntil = Extract<Prismeai.Repeat['repeat'], { until: number }>;

const isRepeatOn = (value: Prismeai.Repeat['repeat']): value is RepeatOn => {
  return !!(value as RepeatOn).on;
};
const isRepeatUntil = (
  value: Prismeai.Repeat['repeat']
): value is RepeatUntil => {
  return !!(value as RepeatUntil).until;
};

export const REPEAT_ITEM_VAR_NAME = 'item';
export const REPEAT_INDEX_VAR_NAME = '$index';
export async function repeat(
  value: Prismeai.Repeat['repeat'],
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
  const until = isRepeatUntil(value) ? value.until : undefined;
  const on = isRepeatOn(value) ? value.on : undefined;
  const { do: doInstructions } = value;

  // Process streams separately
  if (<any>on instanceof Readable) {
    const stream = on as any as Readable;
    for await (let buffer of stream) {
      try {
        buffer = buffer.toString();
        buffer = JSON.parse(buffer);
      } catch {}

      try {
        ctx.set(REPEAT_ITEM_VAR_NAME, buffer);
        await runInstructions(doInstructions, {
          workspace,
          ctx,
          logger,
          broker,
          cache,
        });
      } catch {}
    }
    return;
  }

  const values =
    typeof on === 'object' && !Array.isArray(on)
      ? Object.entries(on).map(([key, value]) => ({ key, value }))
      : on || [];

  const maxIterations =
    typeof until !== 'undefined' &&
    (!on || until < ((<any>values)?.length || 0))
      ? until
      : (<any>values)?.length || 0;
  for (let i = 0; i < maxIterations; i++) {
    // Check throttle every 500 iterations
    const throttleBy = 500;
    if (i > 0 && i % throttleBy === 0) {
      const throttleIterations = Math.min(throttleBy, maxIterations - i);
      await rateLimiter
        .workspace(ctx.workspaceId)
        .repeat(ctx, throttleIterations);
    }

    ctx.set(REPEAT_ITEM_VAR_NAME, values?.length ? values[i] : i);
    ctx.set(REPEAT_INDEX_VAR_NAME, i);
    await runInstructions(doInstructions, {
      workspace,
      ctx,
      logger,
      broker,
      cache,
    });
  }
  ctx.delete(REPEAT_ITEM_VAR_NAME);
}
