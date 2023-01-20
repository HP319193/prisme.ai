import { Schema } from '@prisme.ai/design-system';

export const commonSchema: Schema = {
  type: 'object',
  properties: {
    className: {
      type: 'string',
      title: 'pages.blocks.settings.className.label',
      description: 'pages.blocks.settings.className.description',
    },
  },
};

export default commonSchema;
