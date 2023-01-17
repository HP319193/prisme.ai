export const removedUndefinedProperties = (
  obj: any,
  removeEmptyStrings: boolean = false
) =>
  Object.entries(obj).reduce((newObject: any, [key, value]) => {
    if (value !== undefined) {
      if (!(removeEmptyStrings && value === '')) {
        newObject[key] = value;
      }
    }
    return newObject;
  }, {});

interface MergeAndCleanObjectsOptions {
  shallow?: boolean;
  inexistantIsUndefined?: boolean;
}
export function mergeAndCleanObjects(
  a: any,
  b: any,
  {
    shallow = false,
    inexistantIsUndefined = false,
  }: MergeAndCleanObjectsOptions = {}
) {
  const out = { ...a };
  const keys = Array.from(
    new Set([
      ...Object.keys(b),
      ...(inexistantIsUndefined ? Object.keys(a) : []),
    ])
  );
  keys.forEach((k) => {
    const v = b[k];
    if (v === undefined) {
      delete out[k];
      return;
    }
    if (!shallow && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = mergeAndCleanObjects(out[k], v);
      return;
    }
    out[k] = v;
  });
  return out;
}
