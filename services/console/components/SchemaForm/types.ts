import { ReactElement } from 'react';

export const types = [
  'string',
  'boolean',
  'number',
  'object',
  'array',
] as const;
export type Types = typeof types[number];

export interface Schema {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  required?: string[];
  properties?: Record<string, Schema>;
  oneOf?: Schema[];
  type?: Types;
  items?: Schema;
  additionalProperties?: boolean | Schema;
  'ui:widget'?: string | ((props: any) => ReactElement);
  'ui:options'?: any;
  pattern?: string;
}
