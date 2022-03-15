import { remove as removeDiacritics } from 'diacritics';

export const truncate = (
  str: string = '',
  len: number,
  ellipsis: string = '…'
) => {
  const original = `${str || ''}`;
  const truncated = original.substring(0, len);
  return `${truncated}${original.length > truncated.length ? ellipsis : ''}`;
};

export const slugifyAutomation = (
  workspace: Prismeai.Workspace,
  automationName: string
) => {
  const base = removeDiacritics(automationName)
    .replace(/[^a-zA-Z0-9 _-]+/g, '')
    .trim()
    .slice(0, 20);
  let slug = base;
  let idx = -1;
  while (slug in (workspace.automations || {})) {
    idx++;
    slug = `${base}-${idx}`;
  }

  return slug;
};
