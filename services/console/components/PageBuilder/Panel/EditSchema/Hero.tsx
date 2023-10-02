import { builtinBlocks } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import blocksListSchema from './BlocksList';

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.hero.settings.title.label',
      description: 'pages.blocks.hero.settings.title.description',
    },
    level: {
      type: 'number',
      title: 'pages.blocks.hero.settings.level.label',
      description: 'pages.blocks.hero.settings.level.description',
      enum: [1, 2, 3, 4, 5, 6],
      enumNames: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      default: 2,
    },
    lead: {
      type: 'localized:string',
      title: 'pages.blocks.hero.settings.lead.label',
      description: 'pages.blocks.hero.settings.lead.description',
    },
    content: {
      ...blocksListSchema,
      title: 'pages.blocks.hero.settings.content.label',
      description: 'pages.blocks.hero.settings.content.description',
    },
    img: {
      type: 'string',
      title: 'pages.blocks.hero.settings.img.label',
      description: 'pages.blocks.hero.settings.img.description',
      'ui:widget': 'upload',
      'ui:options': {
        upload: {
          accept: 'image/jpeg,image/png,image/svg+xml',
        },
      },
    },
    backgroundColor: {
      type: 'string',
      title: 'pages.blocks.hero.settings.backgroundColor.label',
      description: 'pages.blocks.lead.settings.backgroundColor.description',
      'ui:widget': 'color',
    },
  },
};

export default schema;
