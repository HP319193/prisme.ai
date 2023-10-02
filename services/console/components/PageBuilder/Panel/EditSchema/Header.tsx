import { builtinBlocks } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import actionSchema from './Action';

export const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.header.settings.title.label',
      description: 'pages.blocks.header.settings.title.description',
    },
    level: {
      type: 'number',
      title: 'pages.blocks.header.settings.level.label',
      description: 'pages.blocks.header.settings.level.description',
      enum: [1, 2, 3, 4, 5, 6],
      enumNames: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      default: 2,
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
        action: {
          type: 'object',
          title: 'pages.blocks.header.settings.logo.action.label',
          description: 'pages.blocks.header.settings.logo.action.description',
          properties: {
            type: {
              title: 'pages.blocks.header.settings.logo.action.type.label',
              oneOf: [
                {
                  title: 'pages.blocks.header.settings.logo.action.none.label',
                  value: '',
                },
                {
                  title:
                    'pages.blocks.header.settings.nav.items.external.label',
                  value: 'external',
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
                  title:
                    'pages.blocks.header.settings.nav.items.internal.label',
                  value: 'internal',
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
                  value: 'inside',
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
                  value: 'event',
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
            },
          },
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
        add: 'pages.blocks.header.settings.nav.items.add',
        remove: 'pages.blocks.header.settings.nav.items.remove',
        properties: actionSchema.properties,
      },
    },
    fixed: {
      type: 'boolean',
      title: 'pages.blocks.header.settings.fixed.label',
      description: 'pages.blocks.header.settings.fixed.description',
    },
  },
};

export default schema;
