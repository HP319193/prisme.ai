import { Schema } from '@prisme.ai/design-system';
import blocksListSchema from './BlocksList';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    content: {
      ...blocksListSchema,
      title: 'pages.blocks.footer.settings.content.label',
      description: 'pages.blocks.footer.settings.content.description',
    },
    ...commonSchema.properties,
  },
};

export default schema;
