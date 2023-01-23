import { FieldProps, Schema } from '@prisme.ai/design-system';
import useSectionsIds from '../../../../providers/Page/useSectionsIds';
import CSSEditor from '../../../../views/Page/CSSEditor';

const CSSEditorField = (props: FieldProps) => {
  return (
    <div className="m-4">
      <CSSEditor {...props} />
    </div>
  );
};

export const commonSchema: Schema = {
  type: 'object',
  properties: {
    className: {
      type: 'string',
      title: 'pages.blocks.settings.className.label',
      description: 'pages.blocks.settings.className.description',
    },
    css: {
      type: 'string',
      title: 'pages.blocks.settings.className.label',
      description: 'pages.blocks.settings.className.description',
      'ui:widget': CSSEditorField,
    },
  },
};

export default commonSchema;
