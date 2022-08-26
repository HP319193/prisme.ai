import get from 'lodash.get';

export function interpolateString(
  str: string,
  values: Record<string, any> = {}
) {
  return str.replace(/\$\{([^}]+)\}/g, (_, m) => get(values, m) || '');
}

export function interpolate(into: any, values: Record<string, any>) {
  if (typeof into === 'string') {
    return interpolateString(into, values);
  }
  const isArray = Array.isArray(into);
  const newObject = isArray ? [...into] : { ...into };
  for (const key of Object.keys(newObject)) {
    const value = newObject[key];
    newObject[key] = interpolate(value, values);
  }
  return newObject;
}
