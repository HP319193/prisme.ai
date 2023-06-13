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
    if (update.type === 'delete') {
      if (!lastKey) {
        obj = undefined;
      } else {
        delete parent[lastKey];
      }
      continue;
    }

    const currentValue = lastKey ? parent[lastKey] : parent;
    let updatedValue;
    if (update.type === 'replace') {
      updatedValue = update.value;
    } else if (update.type === 'push') {
      updatedValue = Array.isArray(currentValue)
        ? [...currentValue, update.value]
        : [update.value];
    } else if (update.type === 'merge') {
      if (Array.isArray(update.value)) {
        updatedValue = [
          ...(Array.isArray(currentValue) ? currentValue : []),
          ...update.value,
        ];
      } else {
        updatedValue = {
          ...(typeof currentValue === 'object' ? currentValue : {}),
          ...update.value,
        };
      }
    }

    if (lastKey) {
      parent[lastKey] = updatedValue;
    } else {
      obj = updatedValue;
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
