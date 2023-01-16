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

export function mergeAndCleanObjects(a: any, b: any) {
  const out = { ...a };
  Object.entries(b).forEach(([k, v]) => {
    if (v === undefined) {
      delete out[k];
      return;
    }
    if (typeof v === 'object') {
      out[k] = mergeAndCleanObjects(out[k], v);
      return;
    }
    out[k] = v;
  });
  return out;
}
