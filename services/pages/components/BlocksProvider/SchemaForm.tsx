import { SchemaForm as OriginalSchemaForm } from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import RichTextEditor from '../../../console/components/RichTextEditor';
import BlockLoader from '../Page/BlockLoader';

const BlockWidget: FieldComponent = ({ schema }) => {
  const { ['ui:options']: { block: { slug, ...config } } = {} } = schema;
  return <BlockLoader name={slug} config={config} />;
};

const components = {
  HTMLEditor: RichTextEditor,
  UiWidgets: {
    block: BlockWidget,
  },
};

export const SchemaForm = ({
  ...props
}: Parameters<typeof OriginalSchemaForm>[0]) => {
  return <OriginalSchemaForm {...props} components={components} />;
};

export default SchemaForm;
