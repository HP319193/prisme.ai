export interface Schema {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  required?: string[];
  properties?: Record<string, Schema>;
  oneOf?: Schema[];
  type?: 'string' | 'boolean' | 'number' | 'object' | 'array';
  items?: Schema;
  additionalProperties?: boolean | Schema;
  'ui:widget'?: string;
  'ui:options'?: any;
  pattern?: string;
}
