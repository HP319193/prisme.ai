import { ContextsManager } from '../../contexts';

export async function deleteInstruction(
  { name }: Prismeai.Delete['delete'],
  ctx: ContextsManager
) {
  await ctx.delete(name);
}
