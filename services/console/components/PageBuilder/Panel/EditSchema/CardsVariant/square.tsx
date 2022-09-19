import { Schema } from '@prisme.ai/design-system';
import { CardVariants } from '@prisme.ai/blocks';
import eventOrLink from './eventOrLink';

const square: Schema = {
  title: 'pages.blocks.cards.settings.square.label',
  value: CardVariants[3],
  properties: {
    cards: {
      type: 'array',
      title: 'pages.blocks.cards.settings.cards',
      items: {
        type: 'object',
        title: 'pages.blocks.cards.settings.card',
        add: 'pages.blocks.cards.settings.cards_add',
        remove: 'pages.blocks.cards.settings.cards_remove',
        properties: {
          title: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.title',
          },
          description: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.description',
          },
          cover: {
            type: 'string',
            title: 'pages.blocks.cards.settings.cover',
            'ui:widget': 'upload',
          },
        },
      },
      action: eventOrLink,
    },
  },
};

export default square;
