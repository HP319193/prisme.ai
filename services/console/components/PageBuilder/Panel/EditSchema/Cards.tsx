import { Schema } from '@prisme.ai/design-system';
import classic from './CardsVariant/classic';
import short from './CardsVariant/short';
import article from './CardsVariant/article';
import square from './CardsVariant/square';
import actions from './CardsVariant/actions';
import blocks from './CardsVariant/blocks';

const schema: Schema = {
  type: 'object',
  properties: {
    variant: {
      title: 'pages.blocks.cards.settings.variant.label',
      oneOf: [classic, short, article, square, actions, blocks],
    },
    layout: {
      type: 'object',
      title: 'pages.blocks.cards.settings.layout.title',
      description: 'pages.blocks.cards.settings.layout.description',
      properties: {
        type: {
          title: 'pages.blocks.cards.settings.layout.style',
          oneOf: [
            {
              title: 'pages.blocks.cards.settings.layout.grid',
              value: 'grid',
            },
            {
              title: 'pages.blocks.cards.settings.layout.column',
              value: 'column',
            },
            {
              title: 'pages.blocks.cards.settings.layout.carousel',
              value: 'carousel',
              properties: {
                autoScroll: {
                  type: 'boolean',
                  title: 'pages.blocks.cards.settings.layout.autoScroll.title',
                  description:
                    'pages.blocks.cards.settings.layout.autoScroll.description',
                },
              },
            },
          ],
        },
      },
    },
  },
};
export default schema;
