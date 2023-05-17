import { Schema } from '@prisme.ai/design-system';
import commonSchema from './commonSchema';

const schema: Schema = {
  type: 'object',
  properties: {
    src: {
      type: 'string',
      title: 'pages.blocks.image.settings.src.label',
      description: 'pages.blocks.image.settings.src.description',
      'ui:widget': 'upload',
    },
    caption: {
      type: 'localized:string',
      title: 'pages.blocks.image.settings.caption.label',
      description: 'pages.blocks.image.settings.caption.description',
      'ui:widget': 'html',
    },
    alt: {
      type: 'localized:string',
      title: 'pages.blocks.image.settings.alt.label',
      description: 'pages.blocks.image.settings.alt.description',
    },
    ...commonSchema.properties,
  },
};

export default schema;
