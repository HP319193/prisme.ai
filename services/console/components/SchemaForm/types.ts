export interface Schema {
  description?: string;
  required?: string[];
  properties?: Record<
    string,
    {
      type: string;
      description?: string;
      'ui:widget'?: string;
      'ui:options'?: any;
    }
  >;
  oneOf?: { required: string[] }[];
  type?: string;
}
