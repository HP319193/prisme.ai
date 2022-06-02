import { Schema } from '@prisme.ai/design-system';

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.settings.blockTitle.label',
      description: 'pages.blocks.settings.blockTitle.description',
    },
    cards: {
      type: 'array',
      title: 'pages.blocks.cards.settings.cards',
      items: {
        type: 'object',
        title: 'pages.blocks.cards.settings.card',
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
          content: {
            type: 'array',
            title: 'pages.blocks.cards.settings.content',
            items: {
              type: 'object',
              title: 'pages.blocks.cards.settings.type',
              oneOf: [
                {
                  title: 'pages.blocks.cards.settings.type_text',
                  properties: {
                    value: {
                      type: 'localized:string',
                      title: 'pages.blocks.cards.settings.text.value',
                    },
                  } as Record<string, Schema>,
                },
                {
                  title: 'pages.blocks.cards.settings.type_button',
                  properties: {
                    value: {
                      type: 'localized:string',
                      title: 'pages.blocks.cards.settings.button.value',
                    },
                    url: {
                      type: 'localized:string',
                      title: 'pages.blocks.cards.settings.button.url',
                    },
                    event: {
                      type: 'string',
                      title: 'pages.blocks.cards.settings.button.event',
                    },
                    payload: {
                      title: 'pages.blocks.cards.settings.button.payload',
                    },
                    icon: {
                      type: 'string',
                      title: 'pages.blocks.cards.settings.button.icon',
                      'ui:widget': 'upload',
                    },
                  },
                },
                {
                  title: 'pages.blocks.cards.settings.type_accordion',
                  properties: {
                    title: {
                      type: 'localized:string',
                      title: 'pages.blocks.cards.settings.accordion.title',
                    },
                    content: {
                      type: 'localized:string',
                      title: 'pages.blocks.cards.settings.accordion.content',
                    },
                    icon: {
                      type: 'string',
                      title: 'pages.blocks.cards.settings.accordion.icon',
                      'ui:widget': 'upload',
                    },
                  },
                },
              ],
              'ui:options': {
                oneOf: {
                  options: [
                    {
                      label: 'pages.blocks.cards.settings.type_text',
                      index: 0,
                      value: {
                        type: 'text',
                      },
                    },
                    {
                      label: 'pages.blocks.cards.settings.type_button',
                      index: 1,
                      value: {
                        type: 'button',
                      },
                    },
                    {
                      label: 'pages.blocks.cards.settings.type_accordion',
                      index: 2,
                      value: {
                        type: 'accordion',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      'ui:options': {
        array: 'row',
      },
    },
    layout: {
      type: 'object',
      oneOf: [
        {
          title: 'pages.blocks.cards.settings.layout.noOptions',
        },
        {
          title: 'pages.blocks.cards.settings.layout.carousel',
          properties: {
            autoScroll: {
              type: 'boolean',
              title: 'pages.blocks.cards.settings.autoScroll.title',
              description: 'pages.blocks.cards.settings.autoScroll.description',
            },
          },
        },
      ],
      'ui:options': {
        oneOf: {
          options: [
            {
              label: 'pages.blocks.cards.settings.layout.grid',
              index: 0,
              value: {
                type: 'grid',
              },
            },
            {
              label: 'pages.blocks.cards.settings.layout.column',
              index: 0,
              value: {
                type: 'column',
              },
            },
            {
              label: 'pages.blocks.cards.settings.layout.carousel',
              index: 1,
              value: {
                type: 'carousel',
              },
            },
          ],
        },
      },
    },
  },
};

export default schema;
