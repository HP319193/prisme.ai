export interface Schema {
  description?: string;
  required?: string[];
  properties?: Record<
    string,
    {
      type: string;
      description?: string;
    }
  >;
  oneOf?: { required: string[] }[];
  type?: string;
}
