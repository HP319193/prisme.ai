import { CardVariants } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import schemaBlocksList from '../BlocksList';

const actions: Schema = {
  title: 'pages.blocks.cards.settings.blocks.label',
  value: CardVariants[5],
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
          content: {
            title: 'pages.blocks.cards.settings.blocks.content.label',
            description:
              'pages.blocks.cards.settings.blocks.content.description',
            ...schemaBlocksList,
          },
        },
      },
    },
  },
};

export default actions;
