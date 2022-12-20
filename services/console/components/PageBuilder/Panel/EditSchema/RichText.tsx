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
    allowScripts: {
      type: 'boolean',
      title: 'pages.blocks.richtext.settings.allowScripts.label',
      description: 'pages.blocks.richtext.settings.allowScripts.description',
    },
  },
};

export default schema;
