import { Schema } from '@prisme.ai/design-system';
import eventOrLink from './eventOrLink';

const schema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      title: 'pages.blocks.datatable.settings.data.label',
      description: 'pages.blocks.datatable.settings.data.description',
      items: {
        type: 'object',
        additionalProperties: {
          add: 'pages.blocks.datatable.settings.data.items.properties.add',
          remove:
            'pages.blocks.datatable.settings.data.items.properties.remove',
        },
        title: 'pages.blocks.datatable.settings.data.items.label',
        description: 'pages.blocks.datatable.settings.data.items.description',
        add: 'pages.blocks.datatable.settings.data.items.add',
        remove: 'pages.blocks.datatable.settings.data.items.remove',
      },
    },
    columns: {
      type: 'array',
      title: 'pages.blocks.datatable.settings.columns.label',
      description: 'pages.blocks.datatable.settings.columns.description',
      items: {
        type: 'object',
        title: 'pages.blocks.datatable.settings.columns.items.label',
        description:
          'pages.blocks.datatable.settings.columns.items.description',
        add: 'pages.blocks.datatable.settings.columns.items.add',
        remove: 'pages.blocks.datatable.settings.columns.items.remove',
        properties: {
          label: {
            type: 'localized:string',
            title: 'pages.blocks.datatable.settings.columns.items._label.label',
            description:
              'pages.blocks.datatable.settings.columns.items._label.description',
          },
          key: {
            type: 'string',
            title: 'pages.blocks.datatable.settings.columns.items.key.label',
            description:
              'pages.blocks.datatable.settings.columns.items.key.description',
          },
          type: {
            type: 'string',
            title: 'pages.blocks.datatable.settings.columns.items.type.label',
            description:
              'pages.blocks.datatable.settings.columns.items.type.description',
            enum: ['string', 'number', 'boolean', 'date', 'tags'],
            enumNames: [
              'pages.blocks.datatable.settings.columns.items.type.string',
              'pages.blocks.datatable.settings.columns.items.type.number',
              'pages.blocks.datatable.settings.columns.items.type.boolean',
              'pages.blocks.datatable.settings.columns.items.type.date',
              'pages.blocks.datatable.settings.columns.items.type.tags',
            ],
          },
          format: {
            title: 'pages.blocks.datatable.settings.columns.items.format.label',
            description:
              'pages.blocks.datatable.settings.columns.items.format.description',
          },
          actions: {
            type: 'array',
            title:
              'pages.blocks.datatable.settings.columns.items.actions.label',
            description:
              'pages.blocks.datatable.settings.columns.items.actions.description',
            items: {
              title:
                'pages.blocks.datatable.settings.columns.items.actions.items.label',
              description:
                'pages.blocks.datatable.settings.columns.items.actions.items.description',
              add: 'pages.blocks.datatable.settings.columns.items.actions.items.add',
              remove:
                'pages.blocks.datatable.settings.columns.items.actions.items.remove',
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                  title:
                    'pages.blocks.datatable.settings.columns.items.actions.items._label.label',
                  description:
                    'pages.blocks.datatable.settings.columns.items.actions.items._label.description',
                },
                action: eventOrLink,
              },
            },
          },
          onEdit: {
            type: 'string',
            title: 'pages.blocks.datatable.settings.columns.items.onEdit.label',
            description:
              'pages.blocks.datatable.settings.columns.items.onEdit.description',
          },
        },
      },
    },
    pagination: {
      type: 'object',
      title: 'pages.blocks.datatable.settings.pagination.label',
      description: 'pages.blocks.datatable.settings.pagination.description',
      properties: {
        event: {
          type: 'string',
          title: 'pages.blocks.datatable.settings.pagination.event.label',
          description:
            'pages.blocks.datatable.settings.pagination.event.description',
        },
        page: {
          type: 'number',
          title: 'pages.blocks.datatable.settings.pagination.page.label',
          description:
            'pages.blocks.datatable.settings.pagination.page.description',
        },
        itemCount: {
          type: 'number',
          title: 'pages.blocks.datatable.settings.pagination.itemCount.label',
          description:
            'pages.blocks.datatable.settings.pagination.itemCount.description',
        },
        pageSize: {
          type: 'number',
          title: 'pages.blocks.datatable.settings.pagination.pageSize.label',
          description:
            'pages.blocks.datatable.settings.pagination.pageSize.description',
        },
      },
    },
    onSort: {
      type: 'object',
      title: 'pages.blocks.datatable.settings.onSort.label',
      description: 'pages.blocks.datatable.settings.onSort.description',
      properties: {
        event: {
          type: 'string',
          title: 'pages.blocks.datatable.settings.onSort.event.label',
          description:
            'pages.blocks.datatable.settings.onSort.event.description',
        },
        payload: {
          title: 'pages.blocks.datatable.settings.onSort.payload.label',
          description:
            'pages.blocks.datatable.settings.onSort.payload.description',
        },
      },
    },
    bulkActions: {
      type: 'array',
      title: 'pages.blocks.datatable.settings.bulkActions.label',
      description: 'pages.blocks.datatable.settings.bulkActions.description',
      items: {
        type: 'object',
        title: 'pages.blocks.datatable.settings.bulkActions.item._label',
        description:
          'pages.blocks.datatable.settings.bulkActions.item.description',
        properties: {
          label: {
            type: 'localized:string',
            title:
              'pages.blocks.datatable.settings.bulkActions.item.label.label',
            description:
              'pages.blocks.datatable.settings.bulkActions.item.label.description',
          },
          onSelect: {
            type: 'object',
            title:
              'pages.blocks.datatable.settings.bulkActions.item.onSelect.label',
            description:
              'pages.blocks.datatable.settings.bulkActions.item.onSelect.description',
            properties: {
              event: {
                type: 'string',
                title:
                  'pages.blocks.datatable.settings.bulkActions.item.onSelect.event.label',
                description:
                  'pages.blocks.datatable.settings.bulkActions.item.onSelect.event.description',
              },
              payload: {
                title:
                  'pages.blocks.datatable.settings.bulkActions.item.onSelect.payload.label',
                description:
                  'pages.blocks.datatable.settings.bulkActions.item.onSelect.payload.description',
              },
            },
          },
        },
      },
    },
    customProps: {
      type: 'object',
      additionalProperties: true,
      title: 'pages.blocks.datatable.settings.customProps.label',
      description: 'pages.blocks.datatable.settings.customProps.description',
    },
  },
} as Schema;

export default schema;
