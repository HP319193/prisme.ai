import { Schema } from '@prisme.ai/design-system';

export async function extendsSchema(
  schema: Schema,
  getSchema: (slug: string, path: string) => Promise<Schema | undefined>
): Promise<Schema> {
  if (typeof schema !== 'object') {
    return schema;
  }
  if (Array.isArray(schema)) {
    return Promise.all(schema.map((v, k) => extendsSchema(v, getSchema)));
  }
  const asArray: any = await Promise.all(
    Object.entries(schema).map(async ([k, v]) => {
      if (typeof v !== 'object' || !v) return [k, v];
      let cleanedV: Schema = { ...v };
      if (Array.isArray(v)) {
        cleanedV = await Promise.all(
          v.map((item) => extendsSchema(item, getSchema))
        );
      } else if (v.extends?.block) {
        const extendsWith = await getSchema(v.extends.block, v.extends.path);
        delete cleanedV.extends;
        cleanedV = {
          ...cleanedV,
          ...extendsWith,
        };
      }
      // Cannot return [k, await extends(…)] directly because
      // on Chrome, but not on server side, if returned value is an array,
      // it is spread and return [k, item1, item2, item3, …] and so,
      // the first itam as a signle object is retreived
      const finalSchema = await extendsSchema(cleanedV, getSchema);
      return [k, finalSchema];
    })
  );

  return Object.fromEntries(asArray);
}
