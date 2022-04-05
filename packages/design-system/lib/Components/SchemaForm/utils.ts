import { Schema } from './types';

export const root = 'values';

export const getDefaultValue = (type: Schema['type']) => {
  switch (type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'string':
    default:
      return '';
  }
};

export const getLabel = (name: string) => {
  const [, ...parts] = name.split(/\./);
  return parts.join('.');
};

export const typesMatch = (schema: Schema, value: any): boolean => {
  if (schema.properties) {
    return Object.keys(schema.properties).every((name) => {
      return schema.properties && schema.properties[name]
        ? typesMatch(schema.properties[name], value[name])
        : false;
    });
  }
  switch (schema.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object';
    default:
      return false;
  }
};
