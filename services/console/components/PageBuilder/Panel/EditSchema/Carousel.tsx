import { Schema } from '@prisme.ai/design-system';
import blocksListSchema from './BlocksList';

const schema: Schema = {
  type: 'object',
  properties: {
    autoscroll: {
      type: 'object',
      title: 'pages.blocks.carousel.settings.autoscroll.label',
      description: 'pages.blocks.carousel.settings.autoscroll.description',
      properties: {
        active: {
          type: 'boolean',
          title: 'pages.blocks.carousel.settings.autoscroll.active.label',
          description:
            'pages.blocks.carousel.settings.autoscroll.active.description',
          default: true,
        },
        speed: {
          type: 'number',
          title: 'pages.blocks.carousel.settings.autoscroll.speed.label',
          description:
            'pages.blocks.carousel.settings.autoscroll.speed.description',
          default: 5,
        },
      },
    },
    displayIndicators: {
      type: 'boolean',
      title: 'pages.blocks.carousel.settings.displayIndicators.label',
      description:
        'pages.blocks.carousel.settings.displayIndicators.description',
    },
    ...blocksListSchema.properties,
  },
};

export default schema;
