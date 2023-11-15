import { extractObjectsByPath } from './extractObjectsByPath';

export function redact(
  event: Prismeai.PrismeEvent,
  fields: string[],
  replaceWith = 'REDACTED'
) {
  for (const field of fields) {
    const parentPath = field.split('.');
    const lastKey = parentPath.pop();
    const parentObj = extractObjectsByPath(event, parentPath);
    if (parentObj && lastKey && lastKey in parentObj) {
      parentObj[lastKey] = replaceWith;
    }
  }
}
