export interface Schema {
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, Schema>;
  oneOf?: { required: string[] }[];
  type: string;
  items?: Schema;
  'ui:widget'?: string;
  'ui:options'?: any;
}
