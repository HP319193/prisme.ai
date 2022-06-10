import { Schema } from '@prisme.ai/design-system';

const schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.settings.blockTitle.label',
      description: 'pages.blocks.settings.blockTitle.description',
    },
    data: {
      type: 'array',
      title: 'pages.blocks.datatable.settings.data.label',
      description: 'pages.blocks.datatable.settings.data.description',
      items: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
        title: 'pages.blocks.datatable.settings.data.items.label',
        description: 'pages.blocks.datatable.settings.data.items.description',
      },
    },
  },
} as Schema;

export default schema;
