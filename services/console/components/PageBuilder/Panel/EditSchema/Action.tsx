import { builtinBlocks } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import { getCommonSchema } from './commonSchema';

export const schema: Schema = {
  type: 'object',
  title: 'pages.blocks.header.settings.nav.items.label',
  description: 'pages.blocks.header.settings.nav.items.description',
  add: 'pages.blocks.header.settings.nav.items.add',
  remove: 'pages.blocks.header.settings.nav.items.remove',
  properties: {
    text: {
      type: 'string',
      title: 'pages.blocks.header.settings.nav.items.text.label',
      description: 'pages.blocks.header.settings.nav.items.text.description',
    },
    type: {
      title: 'pages.blocks.header.settings.nav.items.type.label',
      oneOf: [
        {
          title: 'pages.blocks.header.settings.nav.items.external.label',
          description:
            'pages.blocks.header.settings.nav.items.external.description',
          value: 'external',
          properties: {
            value: {
              type: 'string',
              title:
                'pages.blocks.header.settings.nav.items.external.value.label',
              description:
                'pages.blocks.header.settings.nav.items.external.value.description',
            },
            popup: {
              type: 'boolean',
              title:
                'pages.blocks.header.settings.nav.items.external.popup.label',
              description:
                'pages.blocks.header.settings.nav.items.external.popup.description',
            },
          },
        },
        {
          title: 'pages.blocks.header.settings.nav.items.internal.label',
          description:
            'pages.blocks.header.settings.nav.items.internal.description',
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
          description:
            'pages.blocks.header.settings.nav.items.inside.description',
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
              title: 'pages.blocks.header.settings.nav.items.event.value.label',
              description:
                'pages.blocks.header.settings.nav.items.event.value.description',
              'ui:widget': 'autocomplete',
              'ui:options': {
                autocomplete: 'events:listen',
              },
            },
            payload: {
              title:
                'pages.blocks.header.settings.nav.items.event.payload.label',
              description:
                'pages.blocks.header.settings.nav.items.event.payload.description',
            },
          },
        },
      ],
    },
  },
  ...getCommonSchema(builtinBlocks.Header.styles || ''),
};

export default schema;
