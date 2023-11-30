import { Schema } from '@prisme.ai/design-system';

const schema: Schema = {
  type: 'object',
  properties: {
    content: {
      type: 'localized:string',
      title: 'pages.blocks.head.settings.content.label',
      description: 'pages.blocks.head.settings.content.description',
      'ui:widget': 'textarea',
    },
  },
};

export default schema;
