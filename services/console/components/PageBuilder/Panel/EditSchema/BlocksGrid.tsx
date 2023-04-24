import { Schema } from '@prisme.ai/design-system';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    globalLayout: {
      type: 'object',
      //https://github.com/react-grid-layout/react-grid-layout#grid-layout-props
      title: 'pages.blocks.blocksGrid.settings.globalLayout.label',
      additionalProperties: true,
      properties: {
        compactType: {
          title:
            'pages.blocks.blocksGrid.settings.globalLayout.compactType.label',
          type: 'string',
          enum: ['horizontal', 'vertical'],
        },
        maxRows: {
          title: 'pages.blocks.blocksGrid.settings.globalLayout.maxRows.label',
          type: 'number',
        },
      },
    },
    blocks: {
      type: 'array',
      title: 'pages.blocks.blocksGrid.settings.blocks.label',
      description: 'pages.blocks.blocksGrid.settings.blocks.description',
      add: 'pages.blocks.blocksGrid.settings.blocks.add',
      remove: 'pages.blocks.blocksGrid.settings.blocks.remove',
      items: {
        type: 'object',
        title: 'pages.blocks.blocksGrid.settings.blocks.items.label',
        properties: {
          block: {
            type: 'object',
            title: 'pages.blocks.blocksGrid.settings.blocks.items.block.label',
            description:
              'pages.blocks.blocksGrid.settings.blocks.items.block.description',
            'ui:widget': 'blockSelector',
          },
          layout: {
            type: 'object',
            additionalProperties: true,
            properties: {
              x: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              y: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              h: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              w: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              minH: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              minW: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              maxH: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              maxW: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'number',
              },
              isDraggable: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'boolean',
              },
              isResizable: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'boolean',
              },
              resizeHandles: {
                title:
                  'pages.blocks.blocksGrid.settings.blocks.items.layout.x.label',
                type: 'array',
                'ui:widget': 'tags',
                'ui:options': {
                  tags: {
                    options: [
                      {
                        value: 'n',
                        label: 'Top',
                      },
                      {
                        value: 'e',
                        label: 'Right',
                      },
                      {
                        value: 's',
                        label: 'Bottom',
                      },
                      {
                        value: 'w',
                        label: 'Left',
                      },
                      {
                        value: 'ne',
                        label: 'Top right',
                      },
                      {
                        value: 'nw',
                        label: 'Top left',
                      },
                      {
                        value: 'se',
                        label: 'Bottom right',
                      },
                      {
                        value: 'sw',
                        label: 'Bottom left',
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
    ...commonSchema.properties,
  },
};

export default schema;
