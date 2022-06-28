import { Schema } from '@prisme.ai/design-system';

export const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: 'pages.blocks.header.settings.title.label',
      description: 'pages.blocks.header.settings.title.description',
    },
    logo: {
      type: 'object',
      title: 'pages.blocks.header.settings.logo.label',
      description: 'pages.blocks.header.settings.logo.description',
      properties: {
        src: {
          type: 'string',
          title: 'pages.blocks.header.settings.logo.src.label',
          description: 'pages.blocks.header.settings.logo.src.description',
          'ui:widget': 'upload',
        },
        alt: {
          type: 'string',
          title: 'pages.blocks.header.settings.logo.alt.label',
          description: 'pages.blocks.header.settings.logo.alt.description',
        },
      },
    },
    nav: {
      type: 'array',
      title: 'pages.blocks.header.settings.nav.label',
      description: 'pages.blocks.header.settings.nav.description',
      items: {
        type: 'object',
        title: 'pages.blocks.header.settings.nav.items.label',
        description: 'pages.blocks.header.settings.nav.items.description',
        properties: {
          type: {
            hidden: true,
          },
          text: {
            type: 'string',
            title: 'pages.blocks.header.settings.nav.items.text.label',
            description:
              'pages.blocks.header.settings.nav.items.text.description',
          },
        },
        oneOf: [
          {
            title: 'pages.blocks.header.settings.nav.items.external.label',
            description: 'pages.blocks.header.settings.nav.items.description',
            properties: {
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.external.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.external.value.description',
              },
            },
          },
          {
            title: 'pages.blocks.header.settings.nav.items.internal.label',
            description:
              'pages.blocks.header.settings.nav.items.internal.description',
            properties: {
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.internal.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.internal.value.description',
                'ui:widget': 'select',
                'ui:options': {
                  from: 'pages',
                },
              },
            },
          },
          {
            title: 'pages.blocks.header.settings.nav.items.inside.label',
            description:
              'pages.blocks.header.settings.nav.items.inside.description',
            properties: {
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.inside.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.inside.value.description',
                'ui:widget': 'select',
                'ui:options': {
                  from: 'pageSections',
                },
              },
            },
          },
          {
            title: 'pages.blocks.header.settings.nav.items.event.label',
            description:
              'pages.blocks.header.settings.nav.items.event.description',
            properties: {
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.event.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.event.value.description',
              },
            },
          },
        ],
        'ui:options': {
          oneOf: {
            options: [
              {
                label: 'pages.blocks.header.settings.nav.items.external.label',
                index: 0,
                value: {
                  type: 'external',
                },
              },
              {
                label: 'pages.blocks.header.settings.nav.items.internal.label',
                index: 1,
                value: {
                  type: 'internal',
                },
              },
              {
                label: 'pages.blocks.header.settings.nav.items.inside.label',
                index: 2,
                value: {
                  type: 'inside',
                },
              },
              {
                label: 'pages.blocks.header.settings.nav.items.event.label',
                index: 3,
                value: {
                  type: 'event',
                },
              },
            ],
          },
        },
      },
      'ui:options': {
        array: 'row',
      },
    },
  },
};

export default schema;
