import { Schema } from '@prisme.ai/design-system';

const schema: Schema = {
  type: 'object',
  properties: {
    toastOn: {
      type: 'string',
      title: 'pages.blocks.toast.settings.toastOn.label',
      description: 'pages.blocks.toast.settings.toastOn.description',
    },
  },
};

export default schema;
