import { Schema } from '@prisme.ai/design-system';

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
    redirect: {
      type: 'string',
      title: 'pages.blocks.signin.settings.redirect.label',
      description: 'pages.blocks.signin.settings.redirect.description',
    },
  },
};

export default schema;
