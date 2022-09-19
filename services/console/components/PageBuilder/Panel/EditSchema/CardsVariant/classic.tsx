import { CardVariants } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';

const classic: Schema = {
  title: 'pages.blocks.cards.settings.classic.label',
  value: CardVariants[0],
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
            title: 'pages.blocks.cards.settings.classic.content.label',
            items: {
              add: 'pages.blocks.cards.settings.classic.content.add',
              remove: 'pages.blocks.cards.settings.classic.content.remove',
              type: 'object',
              title: 'pages.blocks.cards.settings.classic.content.item',
              properties: {
                type: {
                  title: 'pages.blocks.cards.settings.classic.content.type',
                  oneOf: [
                    {
                      title:
                        'pages.blocks.cards.settings.classic.content.type_text',
                      value: 'text',
                      properties: {
                        value: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.classic.content.text.value',
                          description:
                            'pages.blocks.cards.settings.classic.content.text.value_description',
                        },
                      },
                    },
                    {
                      title:
                        'pages.blocks.cards.settings.classic.content.type_button',
                      value: 'button',
                      properties: {
                        value: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.classic.content.button.value',
                          description:
                            'pages.blocks.cards.settings.classic.content.button.value_description',
                        },
                        url: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.classic.content.button.url',
                          description:
                            'pages.blocks.cards.settings.classic.content.button.url_description',
                        },
                        popup: {
                          type: 'boolean',
                          title:
                            'pages.blocks.cards.settings.classic.content.button.popup',
                          description:
                            'pages.blocks.cards.settings.classic.content.button.popup_description',
                        },
                        event: {
                          type: 'string',
                          title:
                            'pages.blocks.cards.settings.classic.content.button.event',
                          description:
                            'pages.blocks.cards.settings.classic.content.button.event_description',
                        },
                        payload: {
                          type: 'object',
                          additionalProperties: true,
                          title:
                            'pages.blocks.cards.settings.classic.content.button.payload',
                          description:
                            'pages.blocks.cards.settings.classic.content.button.payload_description',
                        },
                        icon: {
                          type: 'string',
                          'ui:widget': 'upload',
                          title:
                            'pages.blocks.cards.settings.classic.content.button.icon',
                        },
                      },
                    },
                    {
                      title:
                        'pages.blocks.cards.settings.classic.content.type_accordion',
                      value: 'accordion',
                      properties: {
                        title: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.classic.content.accordion.title',
                          description:
                            'pages.blocks.cards.settings.classic.content.accordion.title_description',
                        },
                        content: {
                          type: 'localized:string',
                          title:
                            'pages.blocks.cards.settings.classic.content.accordion.content',
                          description:
                            'pages.blocks.cards.settings.classic.content.accordion.content_description',
                        },
                        icon: {
                          type: 'string',
                          'ui:widget': 'upload',
                          title:
                            'pages.blocks.cards.settings.classic.content.accordion.icon',
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

export default classic;
