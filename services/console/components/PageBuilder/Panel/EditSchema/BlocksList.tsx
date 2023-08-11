import { Schema } from '@prisme.ai/design-system';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    blocks: {
      'ui:widget': 'BlocksList',
    },
    ...commonSchema.properties,
  },
};

export default schema;
