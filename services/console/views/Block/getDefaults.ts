import { Schema } from '@prisme.ai/design-system';

function readObject(schema: Schema) {
  return Object.entries(schema.properties || {}).reduce<any>((prev, [k, v]) => {
    const value = getDefaults(v);
    if (value === undefined) {
      return prev;
    }
    return {
      ...(prev || {}),
      [k]: value,
    };
  }, undefined);
}

export function getDefaults(schema: Schema): any {
  if (schema.default) {
    return schema.default;
  }
  if (!schema.type || schema.type === 'object') {
    return readObject(schema);
  }
  return;
}
