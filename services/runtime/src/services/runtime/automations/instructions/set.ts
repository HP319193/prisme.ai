import { ContextsManager } from '../../contexts';

export async function set(
  { name, value }: Prismeai.Set['set'],
  ctx: ContextsManager
) {
  await ctx.set(name, value);
}
