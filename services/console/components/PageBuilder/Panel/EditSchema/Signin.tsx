import { Schema } from '@prisme.ai/design-system';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    label: {
      type: 'string',
      title: 'pages.blocks.signin.settings.label.label',
      description: 'pages.blocks.signin.settings.label.description',
    },
    up: {
      type: 'boolean',
      title: 'pages.blocks.signin.settings.up.label',
      description: 'pages.blocks.signin.settings.up.description',
    },
    ...commonSchema.properties,
  },
};

export default schema;
