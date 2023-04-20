import { Schema } from '@prisme.ai/design-system';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    firstBlock: {
      type: 'object',
      title: 'pages.blocks.blocksSplit.settings.blocks.firstBlock.label',
      description:
        'pages.blocks.blocksSplit.settings.blocks.genericBlocks.description',
      'ui:widget': 'blockSelector',
    },
    secondBlock: {
      type: 'object',
      title: 'pages.blocks.blocksSplit.settings.blocks.secondBlock.label',
      description:
        'pages.blocks.blocksSplit.settings.blocks.genericBlocks.description',
      'ui:widget': 'blockSelector',
    },
    ...commonSchema.properties,
  },
};

export default schema;
