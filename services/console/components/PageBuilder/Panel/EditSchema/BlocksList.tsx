import { Schema } from '@prisme.ai/design-system';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    blocks: {
      type: 'array',
      title: 'pages.blocks.blockslist.settings.blocks.label',
      description: 'pages.blocks.blockslist.settings.blocks.description',
      add: 'pages.blocks.blockslist.settings.blocks.add',
      remove: 'pages.blocks.blockslist.settings.blocks.remove',
      items: {
        type: 'object',
        title: 'pages.blocks.blockslist.settings.blocks.items.label',
        description:
          'pages.blocks.blockslist.settings.blocks.items.description',
        'ui:widget': 'blockSelector',
      },
    },
    ...commonSchema.properties,
  },
};

export default schema;
