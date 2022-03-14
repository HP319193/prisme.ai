export interface Schema {
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, Schema>;
  oneOf?: { required: string[] }[];
  type: 'string' | 'boolean' | 'number' | 'object' | 'array';
  items?: Schema;
  additionalProperties?: boolean;
  'ui:widget'?: string;
  'ui:options'?: any;
}
