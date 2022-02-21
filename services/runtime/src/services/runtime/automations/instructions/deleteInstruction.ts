import { ContextsManager } from '../../contexts';

export async function deleteInstruction(
  { name }: Prismeai.Delete['delete'],
  ctx: ContextsManager
) {
  ctx.delete(name);
}
