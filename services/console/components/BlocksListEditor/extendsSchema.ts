import { Schema } from '@prisme.ai/design-system';

export async function extendsSchema(
  schema: Schema,
  getSchema: (slug: string, path: string) => Promise<Schema | undefined>
) {
  if (typeof schema !== 'object') {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map((v, k) => v);
  }
  const asArray: any = await Promise.all(
    Object.entries(schema).map(async ([k, v]) => {
      if (typeof v !== 'object') return [k, v];
      let cleanedV: Schema = { ...v };
      if (v.extends?.block) {
        const extendsWith = await getSchema(v.extends.block, v.extends.path);
        delete cleanedV.extends;
        cleanedV = {
          ...cleanedV,
          ...extendsWith,
        };
      }
      return [k, await extendsSchema(cleanedV, getSchema)];
    })
  );

  return Object.fromEntries(asArray);
}
