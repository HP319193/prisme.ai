import { Schema } from '@prisme.ai/design-system';
import blocksListSchema from './BlocksList';

const schema: Schema = {
  type: 'object',
  properties: {
    content: {
      ...blocksListSchema,
      title: 'pages.blocks.footer.settings.content.label',
      description: 'pages.blocks.footer.settings.content.description',
    },
  },
};

export default schema;
