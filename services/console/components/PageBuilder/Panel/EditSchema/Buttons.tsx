import {Schema} from '@prisme.ai/design-system';
import eventOrLink from './eventOrLink';

// text, action, tag, unselected, variant = 'default'

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.settings.blockTitle.label',
      description: 'pages.blocks.settings.blockTitle.description',
    },
    buttons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: {
            type: 'localized:string',
            title: 'pages.blocks.buttons.settings.text.label',
            description: 'pages.blocks.buttons.settings.text.description',
          },
          variant: {
            type: 'string',
            title: 'pages.blocks.buttons.settings.variant.label',
            description: 'pages.blocks.buttons.settings.variant.description',
            enum: ['default', 'primary', 'grey', 'link'],
          },
          tag: {
            type: 'string',
            title: 'pages.blocks.buttons.settings.tag.label',
            description: 'pages.blocks.buttons.settings.tag.description',
          },
          unselected: {
            type: 'boolean',
            title: 'pages.blocks.buttons.settings.unselected.label',
            description: 'pages.blocks.buttons.settings.unselected.description',
          },
          action: eventOrLink,
        },
      },
    },
  },
};

export default schema;
