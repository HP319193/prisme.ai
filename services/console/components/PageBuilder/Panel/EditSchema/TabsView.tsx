import { builtinBlocks } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import actionConfig from './Action';
import blocksListConfig from './BlocksList';

export const schema: Schema = {
  type: 'object',
  properties: {
    tabs: {
      type: 'array',
      title: 'pages.blocks.tabsview.settings.tabs.label',
      description: 'pages.blocks.tabsview.settings.tabs.description',
      items: {
        type: 'object',
        title: 'pages.blocks.tabsview.settings.tabs.items.label',
        description: 'pages.blocks.tabsview.settings.tabs.items.description',
        add: 'pages.blocks.tabsview.settings.tabs.items.add',
        remove: 'pages.blocks.tabsview.settings.tabs.items.remove',
        properties: {
          content: {
            type: 'object',
            title: 'pages.blocks.tabsview.settings.tabs.items.content.label',
            description:
              'pages.blocks.tabsview.settings.tabs.items.content.description',
            properties: {
              ...blocksListConfig.properties,
            },
          },
          ...actionConfig.properties,
        },
      },
    },
    direction: {
      type: 'string',
      enum: ['horizontal', 'vertical'],
      label: 'pages.blocks.tabsview.settings.direction.label',
      enumNames: [
        'pages.blocks.tabsview.settings.direction.horizontal',
        'pages.blocks.tabsview.settings.direction.vertical',
      ],
      default: 'horizontal',
    },
  },
};

export default schema;
