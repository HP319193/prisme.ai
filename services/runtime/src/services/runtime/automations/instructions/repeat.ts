import { Broker } from '@prisme.ai/broker';
import { Logger } from 'pino';
import { runInstructions } from '..';
import { Workspace } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

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
export async function repeat(
  value: Prismeai.Repeat['repeat'],
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
  const until = isRepeatUntil(value) ? value.until : undefined;
  const on = isRepeatOn(value) ? value.on : undefined;
  const { do: doInstructions } = value;

  const values =
    typeof on === 'object' && !Array.isArray(on)
      ? Object.entries(on).map(([key, value]) => ({ key, value }))
      : on || [];

  const maxIterations =
    typeof until !== 'undefined' && until < ((<any>values)?.length || 0)
      ? until
      : (<any>values)?.length || 0;
  for (let i = 0; i < maxIterations; i++) {
    ctx.set(REPEAT_ITEM_VAR_NAME, values?.length ? values[i] : i);
    await runInstructions(doInstructions, {
      workspace,
      ctx,
      logger,
      broker,
    });
  }
  ctx.delete(REPEAT_ITEM_VAR_NAME);
}
