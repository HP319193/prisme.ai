import { Schema } from '@prisme.ai/design-system';

const HAS_NO_FORM = ['all', 'conditions'];
export const instructionHasForm = (name: string, schema: Schema) => {
  return !HAS_NO_FORM.includes(name) && schema.type;
};
