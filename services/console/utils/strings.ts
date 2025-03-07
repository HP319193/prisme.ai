import { remove as removeDiacritics } from 'diacritics';
import hash from 'hash-sum';

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
  automations: Record<string, Prismeai.Automation>,
  automationName: string
) => {
  const base = removeDiacritics(automationName)
    .replace(/[^a-zA-Z0-9 _-]+/g, '')
    .trim()
    .slice(0, 20);
  let slug = base;
  let idx = -1;
  while (slug in (automations || {})) {
    idx++;
    slug = `${base}-${idx}`;
  }

  return slug;
};

export function stringToHexaColor(text: string) {
  return hash(text).substring(0, 6);
}
