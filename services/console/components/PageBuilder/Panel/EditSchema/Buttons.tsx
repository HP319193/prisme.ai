import { builtinBlocks } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
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
      title: 'pages.blocks.buttons.settings.label',
      description: 'pages.blocks.buttons.settings.description',
      items: {
        type: 'object',
        title: 'pages.blocks.buttons.settings.items.label',
        description: 'pages.blocks.buttons.settings.items.description',
        remove: 'pages.blocks.buttons.settings.items.remove',
        add: 'pages.blocks.buttons.settings.items.add',
        properties: {
          text: {
            type: 'localized:string',
            title: 'pages.blocks.buttons.settings.items.text.label',
            description: 'pages.blocks.buttons.settings.items.text.description',
          },
          variant: {
            type: 'string',
            title: 'pages.blocks.buttons.settings.items.variant.label',
            description:
              'pages.blocks.buttons.settings.items.variant.description',
            enum: ['default', 'primary', 'grey', 'link'],
            enumNames: [
              'pages.blocks.buttons.settings.items.variant.label_default',
              'pages.blocks.buttons.settings.items.variant.label_primary',
              'pages.blocks.buttons.settings.items.variant.label_grey',
              'pages.blocks.buttons.settings.items.variant.label_link',
            ],
          },
          disabled: {
            title: 'pages.blocks.buttons.settings.items.disabled.label',
            type: 'boolean',
          },
          tag: {
            type: 'string',
            title: 'pages.blocks.buttons.settings.items.tag.label',
            description: 'pages.blocks.buttons.settings.items.tag.description',
          },
          unselected: {
            type: 'boolean',
            title: 'pages.blocks.buttons.settings.items.unselected.label',
            description:
              'pages.blocks.buttons.settings.items.unselected.description',
          },
          action: eventOrLink,
        },
      },
    },
  },
};

export default schema;
