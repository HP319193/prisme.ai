export function extractObjectsByPath(
  rootObject: any,
  path: string | string[]
): any {
  if (!rootObject) {
    return undefined;
  }
  if (typeof path === 'string' && path in rootObject) {
    return rootObject[path];
  }
  const splittedPath = (typeof path === 'string' ? path.split('.') : path || [])
    .map((cur) => cur.trim())
    .filter(Boolean);
  if (!splittedPath.length) {
    return rootObject;
  }
  for (let i = 0; rootObject && i < splittedPath.length - 1; i++) {
    rootObject = rootObject[splittedPath[i]];
  }
  return rootObject?.[splittedPath[splittedPath.length - 1]];
}
