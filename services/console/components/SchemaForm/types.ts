export interface Schema {
  description?: string;
  required?: string[];
  properties?: Record<
    string,
    {
      type: string;
    }
  >;
  oneOf?: { required: string[] }[];
  type?: string;
}
