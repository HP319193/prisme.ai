import { FieldProps, Schema } from '@prisme.ai/design-system';
import CSSEditor from '../../../../views/Page/CSSEditor';

const defaultStyles = `:block {
  
}`;
const CSSEditorField = (props: FieldProps) => {
  return (
    <div className="m-4">
      <CSSEditor
        {...props}
        label="pages.blocks.settings.css.label"
        description="pages.blocks.settings.css.description"
        reset="pages.blocks.settings.css.reset"
        defaultStyles={defaultStyles}
      />
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
      'ui:widget': CSSEditorField,
      defaut: defaultStyles,
    },
  },
};

export default commonSchema;
