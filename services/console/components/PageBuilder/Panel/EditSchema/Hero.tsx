import { Schema } from '@prisme.ai/design-system';

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
      type: 'array',
      title: 'pages.blocks.hero.settings.content.label',
      description: 'pages.blocks.hero.settings.content.description',
      add: 'pages.blocks.hero.settings.content.add',
      remove: 'pages.blocks.lead.settings.content.remove',
      items: {
        type: 'object',
        title: 'pages.blocks.hero.settings.content.items.label',
        description: 'pages.blocks.hero.settings.content.items.description',
        'ui:widget': 'blockSelector',
      },
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
  },
};

export default schema;
