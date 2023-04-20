import { CardVariants } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';

const actions: Schema = {
  title: 'pages.blocks.cards.settings.actions.label',
  value: CardVariants[4],
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
          backgroundColor: {
            type: 'string',
            title: 'pages.blocks.cards.settings.short.backgroundColor',
            enum: ['transparent-black', 'transparent-white'],
            enumNames: [
              'pages.blocks.cards.settings.short.backgroundColor_transparent-black',
              'pages.blocks.cards.settings.short.backgroundColor_transparent-white',
            ],
          },
          content: {
            type: 'array',
            title: 'pages.blocks.cards.settings.actions.content.label',
            items: {
              add: 'pages.blocks.cards.settings.actions.content.add',
              remove: 'pages.blocks.cards.settings.actions.content.remove',
              type: 'object',
              title: 'pages.blocks.cards.settings.actions.content.item',
              properties: {
                type: {
                  title: 'pages.blocks.cards.settings.actions.content.type',
                  oneOf: [
                    {
                      title:
                        'pages.blocks.cards.settings.actions.content.type_event',
                      value: 'event',
                      properties: {
                        text: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.actions.content.text',
                        },
                        value: {
                          type: 'string',
                          title:
                            'pages.blocks.cards.settings.actions.content.value_event',
                        },
                        payload: {
                          type: 'object',
                          additionalProperties: true,
                          title:
                            'pages.blocks.cards.settings.actions.content.payload',
                        },
                      },
                    },
                    {
                      title:
                        'pages.blocks.cards.settings.actions.content.type_url',
                      value: 'url',
                      properties: {
                        text: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.actions.content.text',
                        },
                        value: {
                          type: 'string',
                          title:
                            'pages.blocks.cards.settings.actions.content.value_url',
                        },
                        popup: {
                          title: 'pages.blocks.settings.action.popup.label',
                          description:
                            'pages.blocks.settings.action.popup.description',
                          type: 'boolean',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};

export default actions;
