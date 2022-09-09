import { CardVariants } from '@prisme.ai/blocks/';
import { Schema } from '@prisme.ai/design-system';

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.settings.blockTitle.label',
      description: 'pages.blocks.settings.blockTitle.description',
    },
    variant: {
      title: 'pages.blocks.cards.settings.variant.label',
      oneOf: [
        {
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
                      remove:
                        'pages.blocks.cards.settings.classic.content.remove',
                      type: 'object',
                      title: 'pages.blocks.cards.settings.classic.content.item',
                      properties: {
                        type: {
                          title:
                            'pages.blocks.cards.settings.classic.content.type',
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
        },
        {
          title: 'pages.blocks.cards.settings.short.label',
          value: CardVariants[1],
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
                  subtitle: {
                    type: 'localized:string',
                    title: 'pages.blocks.cards.settings.short.subtitle',
                  },
                  description: {
                    type: 'localized:string',
                    title: 'pages.blocks.cards.settings.description',
                    'ui:widget': 'textarea',
                  },
                  backgroundColor: {
                    type: 'string',
                    title: 'pages.blocks.cards.settings.short.backgroundColor',
                    enum: [
                      'black',
                      'white',
                      'transparent-white',
                      'transparent-black',
                    ],
                    enumNames: [
                      'pages.blocks.cards.settings.short.backgroundColor_black',
                      'pages.blocks.cards.settings.short.backgroundColor_white',
                      'pages.blocks.cards.settings.short.backgroundColor_transparent-white',
                      'pages.blocks.cards.settings.short.backgroundColor_transparent-black',
                    ],
                  },
                },
              },
            },
          },
        },
        {
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
                },
              },
            },
          },
        },
        {
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
            },
          },
        },
        {
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
                  content: {
                    type: 'array',
                    title: 'pages.blocks.cards.settings.actions.content.label',
                    items: {
                      add: 'pages.blocks.cards.settings.actions.content.add',
                      remove:
                        'pages.blocks.cards.settings.actions.content.remove',
                      type: 'object',
                      title: 'pages.blocks.cards.settings.actions.content.item',
                      properties: {
                        type: {
                          title:
                            'pages.blocks.cards.settings.actions.content.type',
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
        },
      ],
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
