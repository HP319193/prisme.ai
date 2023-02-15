import { SchemaForm, useSchemaForm } from '@prisme.ai/design-system';
import { useBlockSelector } from './BlockSelectorProvider';

interface SchemaFormProps {
  values: Record<string, any>;
  onChange: (values: SchemaFormProps['values']) => void;
}

export const Form = ({ values, onChange }: SchemaFormProps) => {
  const { schema } = useBlockSelector();
  const { utils, locales, components } = useSchemaForm();

  if (!schema) return null;

  return (
    <SchemaForm
      schema={schema}
      locales={locales}
      buttons={[]}
      initialValues={values}
      utils={utils}
      components={components}
      onChange={onChange}
    />
  );
};

export default Form;
