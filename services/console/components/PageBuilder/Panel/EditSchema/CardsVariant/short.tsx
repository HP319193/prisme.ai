import { CardVariants } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import eventOrLink from '../eventOrLink';

const short: Schema = {
  title: 'pages.blocks.cards.settings.short.label',
  value: CardVariants[1],
  properties: {
    cards: {
      type: 'array',
      title: 'pages.blocks.cards.settings.cards',
      items: {
        add: 'pages.blocks.cards.settings.cards_add',
        remove: 'pages.blocks.cards.settings.cards_remove',
        type: 'object',
        title: 'pages.blocks.cards.settings.card',
        properties: {
          title: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.title',
          },
          subtitle: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.short.subtitle',
          },
          description: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.description',
            'ui:widget': 'textarea',
          },
          action: eventOrLink,
          backgroundColor: {
            type: 'string',
            title: 'pages.blocks.cards.settings.short.backgroundColor',
            enum: ['black', 'white', 'transparent-white', 'transparent-black'],
            enumNames: [
              'pages.blocks.cards.settings.short.backgroundColor_black',
              'pages.blocks.cards.settings.short.backgroundColor_white',
              'pages.blocks.cards.settings.short.backgroundColor_transparent-white',
              'pages.blocks.cards.settings.short.backgroundColor_transparent-black',
            ],
          },
        },
      },
    },
  },
};

export default short;
