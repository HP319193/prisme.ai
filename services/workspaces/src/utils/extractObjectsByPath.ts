export interface ExtractedObject<T> {
  path: string[];
  lastKey: string;
  value: T;
}

export function extractObjectsByPath<T>(
  rootObject: T,
  path: string | string[],
  fullpath: string[] = []
): ExtractedObject<T>[] {
  const splittedPath = typeof path === 'string' ? path.split('.') : path;
  let currentDepth: any = rootObject;
  if (!splittedPath.length) {
    return [
      {
        path: fullpath,
        lastKey: fullpath[fullpath.length - 1] || '',
        value: currentDepth,
      },
    ];
  }
  return splittedPath.reduce((objects, currentKey, currentIdx) => {
    if (!currentDepth) {
      // We've travelled all the way through
      return objects;
    }

    // If we're on a '*' key, recursively call this function for every keys of current depth
    if (currentKey === '*') {
      return [
        ...objects,
        ...Object.keys(currentDepth || {}).flatMap((key) => {
          return extractObjectsByPath(
            currentDepth[key],
            splittedPath.slice(currentIdx + 1),
            [...fullpath, key]
          );
        }),
      ];
    }
    currentDepth = currentDepth[currentKey];
    if (currentDepth && currentIdx === splittedPath.length - 1) {
      return [
        ...objects,
        ...extractObjectsByPath(currentDepth, [], [...fullpath, currentKey]),
      ];
    }
    fullpath = [...fullpath, currentKey];

    return objects;
  }, [] as any);
}
