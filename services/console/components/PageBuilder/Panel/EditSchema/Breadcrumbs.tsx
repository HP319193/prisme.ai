import { Schema } from '@prisme.ai/design-system';
import { builtinBlocks } from '@prisme.ai/blocks';
import actionSchema from './Action';

const schema: Schema = {
  type: 'object',
  properties: {
    links: {
      type: 'array',
      title: 'pages.blocks.breadcrumbs.settings.links.label',
      description: 'pages.blocks.breadcrumbs.settings.links.description',
      items: actionSchema,
      _items: {
        type: 'object',
        title: 'pages.blocks.breadcrumbs.settings.links.items.label',
        description:
          'pages.blocks.breadcrumbs.settings.links.items.description',
        add: 'pages.blocks.breadcrumbs.settings.links.items.add',
        remove: 'pages.blocks.breadcrumbs.settings.links.items.remove',
        properties: {
          href: {
            type: 'string',
            title: 'pages.blocks.breadcrumbs.settings.links.items.href.label',
            description:
              'pages.blocks.breadcrumbs.settings.links.items.href.description',
            'ui:widget': 'select',
            'ui:options': {
              from: 'pages',
            },
          },
          text: {
            type: 'string',
            title: 'pages.blocks.breadcrumbs.settings.links.items._label.label',
            description:
              'pages.blocks.breadcrumbs.settings.links.items._label.description',
          },
        },
      },
    },
  },
};

export default schema;
