import { Schema } from '@prisme.ai/design-system';

const eventOrLink: Schema = {
  type: 'object',
  title: 'pages.blocks.settings.action.title',
  description: 'pages.blocks.settings.action.description',
  properties: {
    type: {
      title: 'pages.blocks.settings.action.title',
      description: 'pages.blocks.settings.action.description',
      oneOf: [
        {
          title: 'pages.blocks.settings.action.event',
          description: 'pages.blocks.settings.action.event.description',
          value: 'event',
          properties: {
            value: {
              title: 'pages.blocks.settings.action.valueEvent.label',
              description:
                'pages.blocks.settings.action.valueEvent.description',
              type: 'string',
            },
            payload: {
              title: 'pages.blocks.settings.action.payload.label',
              description: 'pages.blocks.settings.action.payload.description',
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
              title: 'pages.blocks.settings.action.valueLink.label',
              description: 'pages.blocks.settings.action.valueLink.description',
              type: 'string',
            },
            popup: {
              title: 'pages.blocks.settings.action.popup.label',
              description: 'pages.blocks.settings.action.popup.description',
              type: 'boolean',
            },
          },
        },
      ],
    },
  },
};

export default eventOrLink;
