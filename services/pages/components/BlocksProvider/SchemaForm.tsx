import { SchemaForm as OriginalSchemaForm } from '@prisme.ai/design-system';
import RichTextEditor from '../../../console/components/RichTextEditor';

const components = {
  HTMLEditor: RichTextEditor,
};

export const SchemaForm = ({
  ...props
}: Parameters<typeof OriginalSchemaForm>[0]) => {
  return <OriginalSchemaForm {...props} components={components} />;
};

export default SchemaForm;
