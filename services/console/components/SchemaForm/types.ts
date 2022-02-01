export interface Schema {
  required?: string[];
  properties?: Record<
    string,
    {
      type: string;
    }
  >;
  oneOf?: { required: string[] }[];
}
