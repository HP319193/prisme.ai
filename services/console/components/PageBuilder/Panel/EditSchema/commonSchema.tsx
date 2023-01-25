import { FieldProps, Schema } from '@prisme.ai/design-system';
import CSSEditor from '../../../../views/Page/CSSEditor';

const defaultStyles = `:block {
  
}`;
const getCSSEditorField = (styles: string) =>
  function CSSEditorField(props: FieldProps) {
    return (
      <div className="m-4">
        <CSSEditor
          {...props}
          label="pages.blocks.settings.css.label"
          description="pages.blocks.settings.css.description"
          reset="pages.blocks.settings.css.reset"
          defaultStyles={styles}
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
      'ui:widget': getCSSEditorField(defaultStyles),
      defaut: defaultStyles,
    },
  },
};

export function getCommonSchema(styles: string) {
  return {
    ...commonSchema.properties,
    css: {
      ...commonSchema?.properties?.css,
      default: styles,
      'ui:widget': getCSSEditorField(styles),
    },
  };
}

export default commonSchema;
