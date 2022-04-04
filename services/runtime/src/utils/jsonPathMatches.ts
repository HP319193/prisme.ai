import { evaluate } from './evaluate';

export function jsonPathMatches(
  jsonPaths: Record<string, any> | undefined,
  object: any
) {
  if (!jsonPaths) {
    return true;
  }

  return Object.entries(jsonPaths)
    .map(([k, v]) =>
      evaluate(`{{payload.${k}}} == {{value}}`, {
        payload: object,
        value: v,
      })
    )
    .every(Boolean);
}
