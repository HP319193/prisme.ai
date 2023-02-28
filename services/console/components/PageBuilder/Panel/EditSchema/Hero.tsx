import { builtinBlocks } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import blocksListSchema from './BlocksList';
import { getCommonSchema } from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.hero.settings.title.label',
      description: 'pages.blocks.hero.settings.title.description',
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
      description: 'pages.blocks.lead.settings.img.description',
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
    ...getCommonSchema(builtinBlocks.Hero.styles || ''),
  },
};

export default schema;
