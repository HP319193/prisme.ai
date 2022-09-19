import { Schema } from '@prisme.ai/design-system';

const eventOrLink: Schema = {
  type: 'object',
  title: 'pages.blocks.cards.settings.action.title',
  properties: {
    type: {
      title: 'pages.blocks.cards.settings.action.title',
      description: 'pages.blocks.cards.settings.action.description',
      oneOf: [
        {
          title: 'pages.blocks.cards.settings.action.event',
          value: 'event',
          properties: {
            value: {
              title: 'pages.blocks.cards.settings.action.valueEvent',
              type: 'string',
            },
            payload: {
              title: 'pages.blocks.cards.settings.action.payload',
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        {
          title: 'pages.blocks.cards.settings.action.url',
          value: 'url',
          properties: {
            value: {
              title: 'pages.blocks.cards.settings.action.valueLink',
              type: 'string',
            },
            newTab: {
              title: 'pages.blocks.cards.settings.action.newTab',
              type: 'boolean',
            },
          },
        },
      ],
    },
  },
};

export default eventOrLink;
