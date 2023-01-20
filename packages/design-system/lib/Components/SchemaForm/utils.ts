import { FieldMetaState, UseFieldConfig } from 'react-final-form';
import { Schema } from './types';

export const root = 'values';
export const EMPTY = '__EMPTY__';

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

export const getLabel = (name: string, schemaTitle?: string) => {
  if (schemaTitle === '') return '';
  const [, ...parts] = name.split(/\./);
  return parts.map((part) => (part === EMPTY ? '' : part)).join('.');
};

export const typesMatch = (schema: Schema, value: any): boolean => {
  if (value === undefined) return false;

  if (schema.properties) {
    return Object.entries(schema.properties).every(([name, property]) => {
      return property && value ? typesMatch(property, value[name]) : false;
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

export function getFieldOptions({
  pattern,
  errors = {},
  default: defaultValue,
}: Schema = {}): UseFieldConfig<any, any> {
  return {
    validate: (value: any) => {
      if (pattern && !new RegExp(pattern).test(`${value}`)) {
        return errors.pattern || 'pattern';
      }
    },
    defaultValue,
  };
}

export function getError({ dirty, error, submitError }: FieldMetaState<any>) {
  const hasError = dirty && (error || submitError);
  return typeof hasError === 'string' ? hasError : '';
}
