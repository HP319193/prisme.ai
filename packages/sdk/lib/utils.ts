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
