import { Schema } from '@prisme.ai/design-system';

export const schema: Schema = {
  type: 'object',
  title: 'pages.blocks.header.settings.nav.items.label',
  description: 'pages.blocks.header.settings.nav.items.description',
  add: 'pages.blocks.header.settings.nav.items.add',
  remove: 'pages.blocks.header.settings.nav.items.remove',
  properties: {
    text: {
      type: 'localized:string',
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
    confirm: {
      type: 'object',
      title: 'pages.blocks.action.settings.confirm.label',
      description: 'pages.blocks.action.settings.confirm.description',
      properties: {
        label: {
          type: 'string',
          title: 'pages.blocks.action.settings.confirm._label.label',
          description:
            'pages.blocks.action.settings.confirm._label.description',
        },
        yesLabel: {
          type: 'string',
          title: 'pages.blocks.action.settings.confirm.yesLabel.label',
          description:
            'pages.blocks.action.settings.confirm.yesLabel.description',
        },
        noLabel: {
          type: 'string',
          title: 'pages.blocks.action.settings.confirm.noLabel.label',
          description:
            'pages.blocks.action.settings.confirm.noLabel.description',
        },
        placement: {
          type: 'string',
          enum: ['top', 'bottom', 'left', 'right'],
          enumNames: [
            'pages.blocks.action.settings.confirm.placement.top',
            'pages.blocks.action.settings.confirm.placement.bottom',
            'pages.blocks.action.settings.confirm.placement.left',
            'pages.blocks.action.settings.confirm.placement.right',
          ],
          title: 'pages.blocks.action.settings.confirm.placement.label',
          description:
            'pages.blocks.action.settings.confirm.placement.description',
        },
      },
    },
  },
};

export default schema;
