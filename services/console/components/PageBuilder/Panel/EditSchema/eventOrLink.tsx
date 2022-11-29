import { Schema } from '@prisme.ai/design-system';

const eventOrLink: Schema = {
  type: 'object',
  title: 'pages.blocks.settings.action.title',
  properties: {
    type: {
      title: 'pages.blocks.settings.action.title',
      description: 'pages.blocks.settings.action.description',
      oneOf: [
        {
          title: 'pages.blocks.settings.action.event',
          value: 'event',
          properties: {
            value: {
              title: 'pages.blocks.settings.action.valueEvent',
              type: 'string',
            },
            payload: {
              title: 'pages.blocks.settings.action.payload',
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        {
          title: 'pages.blocks.settings.action.url',
          value: 'url',
          properties: {
            value: {
              title: 'pages.blocks.settings.action.valueLink',
              type: 'string',
            },
            popup: {
              title: 'pages.blocks.settings.action.popup',
              type: 'boolean',
            },
          },
        },
      ],
    },
  },
};

export default eventOrLink;
