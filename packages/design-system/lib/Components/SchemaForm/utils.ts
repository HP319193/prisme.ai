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

export const getLabel = (name: string, schemaTitle?: Schema['title']) => {
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
  validators = {} as Schema['validators'],
  pattern,
  errors = {},
  default: defaultValue,
}: Schema = {}): UseFieldConfig<any, any> {
  if (!validators) return defaultValue;
  if (pattern && !validators.pattern) {
    validators.pattern = {
      value: pattern,
      message: errors?.pattern,
    };
  }
  return {
    validate: (toCheck: any) => {
      return Object.entries(validators).reduce<null | string>(
        (prev, [type, options]) => {
          const { value = '', message = '' } =
            typeof options === 'boolean' ? {} : options;
          if (prev) return prev;
          switch (type) {
            case 'required':
              if (['', undefined, null].includes(toCheck)) {
                return message || 'required';
              }
            case 'pattern':
              if (
                typeof value !== 'string' ||
                !new RegExp(value).test(`${toCheck}`)
              ) {
                return message || 'pattern';
              }
              return null;
            case 'tel':
              if (!new RegExp(/^[0-9\+]+$/).test(`${toCheck}`)) {
                return message || 'tel';
              }
              return null;
            case 'min':
              if (+toCheck < +(value || 0)) {
                return message || 'min';
              }
              return null;
            case 'max':
              if (+toCheck > +(value || 0)) {
                return message || 'max';
              }
              return null;
            case 'email':
              if (
                !new RegExp(/^[\w-\.\+]+@([\w-]+\.)+[\w-]{2,4}$/).test(
                  `${toCheck}`
                )
              ) {
                return message || 'email';
              }
              return null;
            case 'date':
              const date = new Date(toCheck);
              if (date.toString() === 'Invalid Date') {
                return message || 'date';
              }
              return null;
          }
          return prev;
        },
        null
      );
    },
    defaultValue,
  };
}

export function getError({ dirty, error, submitError }: FieldMetaState<any>) {
  const hasError = dirty && (error || submitError);
  return typeof hasError === 'string' ? hasError : '';
}

export function getInputMode(schema: Schema) {
  if (schema.validators && schema.validators.tel) {
    return 'tel';
  }
  if (schema.validators && schema.validators.email) {
    return 'email';
  }
  return schema.type === 'number' ? 'numeric' : 'text';
}

export function getProperties(schema: Schema, values: any): string[] {
  return Object.entries(schema.properties || {}).flatMap(([k, v]) => {
    let dynamicProperties: string[] = [];
    if (v.oneOf) {
      const oneOf = v.oneOf.find(({ value }) => value === values[k]) as Schema;
      dynamicProperties = oneOf ? getProperties(oneOf, values) : [];
    }
    return [k, ...dynamicProperties];
  });
}
