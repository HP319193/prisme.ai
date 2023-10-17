import {
  Schema,
  SchemaForm as OriginalSchemaForm,
  SchemaFormProps,
  useSchemaForm,
} from '@prisme.ai/design-system';
import { useEffect, useState } from 'react';
import { useWorkspaceBlocks } from '../../providers/WorkspaceBlocksProvider';
import useLocalizedText from '../../utils/useLocalizedText';
import componentsWithBlocksList from '../BlocksListEditor/componentsWithBlocksList';
import { extendsSchema } from '../BlocksListEditor/extendsSchema';
import useSchema from './useSchema';

interface SchemaFormProviderProps extends SchemaFormProps {
  schema: Schema;
}

export const SchemaForm = ({
  schema: originalSchema,
  ...props
}: SchemaFormProviderProps) => {
  const { localizeSchemaForm } = useLocalizedText();
  const [schema, setSchema] = useState(originalSchema);
  const { getSchema } = useWorkspaceBlocks();
  const { locales } = useSchemaForm();
  const utils = useSchema();

  useEffect(() => {
    async function init() {
      setSchema(await extendsSchema(originalSchema, getSchema));
    }
    init();
  }, [getSchema, localizeSchemaForm, originalSchema]);

  return (
    <OriginalSchemaForm
      schema={schema}
      components={componentsWithBlocksList}
      locales={locales}
      utils={utils}
      {...props}
    />
  );
};

export default SchemaForm;
