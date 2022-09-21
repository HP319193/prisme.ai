import { CardVariants } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import eventOrLink from './eventOrLink';

const article: Schema = {
  title: 'pages.blocks.cards.settings.article.label',
  value: CardVariants[2],
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
          subtitle: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.article.subtitle',
          },
          tag: {
            type: 'localized:string',
            title: 'pages.blocks.cards.settings.article.tag',
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
          action: eventOrLink,
        },
      },
    },
  },
};

export default article;
