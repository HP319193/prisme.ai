import { Schema } from '@prisme.ai/design-system';

const extractEventFromSchema = (schema: Schema, value: any): string[] => {
  if (!value) return [];
  if (schema.type === 'object') {
    return Object.keys(schema.properties || {}).flatMap((key) =>
      value[key]
        ? extractEventFromSchema((schema.properties || {})[key], value[key])
        : []
    );
  }
  if (schema.type === 'array' && schema.items) {
    return Array.isArray(value)
      ? value.flatMap((v) => extractEventFromSchema(schema.items || [], v))
      : [];
  }
  if (schema.type !== 'string' || !schema.event) {
    return [];
  }
  // We have en event !! look for the value now
  return [value];
};

export const extractEvents = (
  blocksSchemas: Map<string, Schema>,
  config: any
) => {
  const schemas = Array.from(blocksSchemas.values());
  const events = schemas.flatMap((schema) => {
    const { onInit, updateOn } = config || {};
    const events = new Set(extractEventFromSchema(schema, config));
    onInit && events.add(onInit);
    updateOn && events.add(updateOn);
    return Array.from(events);
  });
  return events;
};
