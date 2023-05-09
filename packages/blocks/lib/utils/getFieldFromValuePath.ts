import { Schema } from '@prisme.ai/design-system';

export default function getFieldFromValuePath(schema: Schema, path: string) {
  const pathParts = path.split(/\./);
  const found = pathParts.reduce<Schema | null>((prev, p) => {
    if (!prev || !prev.properties) return null;
    return prev.properties[p];
  }, schema);
  return found;
}
