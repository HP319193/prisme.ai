export type ContextUpdateOpLog =
  Prismeai.UpdatedContexts['payload']['updates'][0];

export function applyObjectUpdateOpLogs(
  obj: any,
  updates: ContextUpdateOpLog[]
) {
  for (const update of updates) {
    const splittedPath = update.path.split('.');
    const parentPath =
      splittedPath.length > 1 ? splittedPath.slice(0, -1) : undefined;
    const lastKey = splittedPath[splittedPath.length - 1];
    const parent = parentPath ? extractSubPath(obj, parentPath) : obj;
    if (update.type === 'replace') {
      parent[lastKey] = update.value;
    } else if (update.type === 'push') {
      parent[lastKey] = Array.isArray(parent[lastKey])
        ? [...parent[lastKey], update.value]
        : [update.value];
    } else if (update.type === 'merge') {
      parent[lastKey] = {
        ...(typeof parent[lastKey] === 'object' ? parent[lastKey] : {}),
        ...update.value,
      };
    } else if (update.type === 'delete') {
      delete parent[lastKey];
    }
  }
  return obj;
}

function extractSubPath(obj: any, path: string[]) {
  let curObj = obj;
  for (const cur of path) {
    if (!(cur in curObj)) {
      curObj[cur] = {};
    }
    curObj = curObj[cur];
  }
  return curObj;
}
