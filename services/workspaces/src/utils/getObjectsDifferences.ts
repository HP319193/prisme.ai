/*
 * Most of this code comes from a stackoverflow's comment
 * https://stackoverflow.com/questions/8572826/generic-deep-diff-between-two-objects
 */

export enum DiffType {
  ValueCreated = 'created',
  ValueUpdated = 'updated',
  ValueDeleted = 'deleted',
  ValueUnchanged = 'unchanged',
}

export type Diffs = {
  __type: DiffType;
  data: Record<string, Diffs> | any;
};

function isFunction(x: any) {
  return Object.prototype.toString.call(x) === '[object Function]';
}

function isArray(x: any) {
  return Object.prototype.toString.call(x) === '[object Array]';
}

function isDate(x: any) {
  return Object.prototype.toString.call(x) === '[object Date]';
}

function isObject(x: any) {
  return Object.prototype.toString.call(x) === '[object Object]';
}

function isValue(x: any) {
  return typeof x !== 'undefined' && !isObject(x) && !isArray(x);
}

function compareValues<T>(value1: T, value2: T) {
  if (value1 === value2) {
    return DiffType.ValueUnchanged;
  }
  if (
    isDate(value1) &&
    isDate(value2) &&
    //@ts-ignore
    value1.getTime() === value2.getTime()
  ) {
    return DiffType.ValueUnchanged;
  }
  if (value1 === undefined) {
    return DiffType.ValueCreated;
  }
  if (value2 === undefined) {
    return DiffType.ValueDeleted;
  }
  return DiffType.ValueUpdated;
}

export function getObjectsDifferences<RawType>(
  obj1: RawType,
  obj2: RawType,
  ignoreFields?: string[]
): Diffs {
  if (isFunction(obj1) || isFunction(obj2)) {
    throw 'Invalid argument. Function given, object expected.';
  }
  if (isValue(obj1) || isValue(obj2)) {
    return {
      __type: compareValues(obj1, obj2),
      data: obj2 === undefined ? obj1 : obj2,
    };
  }

  const diff: any = {
    __type: DiffType.ValueUnchanged,
    data: {},
  };
  if (obj1 === undefined && obj2 === undefined) {
    return diff;
  }
  if (typeof obj1 === 'undefined') {
    diff.__type = DiffType.ValueCreated;
  } else if (typeof obj2 === 'undefined') {
    diff.__type = DiffType.ValueDeleted;
  }

  for (const key in obj1) {
    if (isFunction(obj1[key])) {
      continue;
    }

    let value2 = undefined;
    if (obj2?.[key] !== undefined) {
      value2 = obj2[key];
    }

    diff.data[key] = getObjectsDifferences(obj1[key], value2);
    if (
      diff['__type'] === DiffType.ValueUnchanged &&
      diff.data[key].__type !== DiffType.ValueUnchanged
    ) {
      diff['__type'] = DiffType.ValueUpdated;
    }
  }
  for (const key in obj2) {
    if (isFunction(obj2[key]) || diff.data[key] !== undefined) {
      continue;
    }

    // Here key is a created field not existing in obj1
    diff.data[key] = getObjectsDifferences(undefined, obj2[key]);
    if (
      diff['__type'] === DiffType.ValueUnchanged &&
      diff.data[key].__type !== DiffType.ValueUnchanged
    ) {
      diff['__type'] = DiffType.ValueUpdated;
    }
  }

  return diff;
}

export function areObjectsEqual<RawType>(obj1: RawType, obj2: RawType) {
  const diffs = getObjectsDifferences(obj1, obj2);
  return diffs.__type === DiffType.ValueUnchanged;
}
