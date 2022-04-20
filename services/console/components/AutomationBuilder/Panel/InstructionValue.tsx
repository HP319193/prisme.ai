import { FC, useMemo } from 'react';
import Fieldset from '../../../layouts/Fieldset';
import { useTranslation } from 'next-i18next';
import { SchemaForm } from '@prisme.ai/design-system';
import { CodeEditorInline } from '../../CodeEditor/lazy';

interface InstructionValueProps {
  instruction: string;
  value: any;
  schema?: any;
  onChange: (values: any) => void;
}

const EmptyButtons: any[] = [];
const components = {
  JSONEditor: (props: any) => <CodeEditorInline {...props} mode="json" />,
};

export const InstructionValue: FC<InstructionValueProps> = ({
  instruction,
  value,
  schema = {},
  onChange,
}) => {
  const { t } = useTranslation('workspaces');
  const schemaWithDescription = useMemo(
    () => ({
      ...schema,
      title: t('automations.instruction.description', {
        context: instruction,
        default: schema.description,
      }),
    }),
    [instruction, schema, t]
  );
  if (!schema) return null;

  return (
    <Fieldset legend={instruction} hasDivider={false}>
      <SchemaForm
        schema={schemaWithDescription}
        onChange={onChange}
        initialValues={value}
        buttons={EmptyButtons}
        components={components}
      />
    </Fieldset>
  );
};

export default InstructionValue;
