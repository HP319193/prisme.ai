export function extractObjectsByPath(
  rootObject: any,
  path: string | string[]
): any {
  const splittedPath = (typeof path === 'string' ? path.split('.') : path || [])
    .map((cur) => cur.trim())
    .filter(Boolean);
  if (!rootObject) {
    return undefined;
  }
  if (!splittedPath.length) {
    return rootObject;
  }
  for (let i = 0; rootObject && i < splittedPath.length - 1; i++) {
    rootObject = rootObject[splittedPath[i]];
  }
  return rootObject?.[splittedPath[splittedPath.length - 1]];
}
