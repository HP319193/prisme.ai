import { Schema } from '@prisme.ai/design-system';

const schema: Schema = {
  type: 'object',
  properties: {
    content: {
      type: 'localized:string',
      title: 'pages.blocks.richtext.settings.content.label',
      description: 'pages.blocks.richtext.settings.content.description',
      'ui:widget': 'textarea',
    },
  },
};

export default schema;
