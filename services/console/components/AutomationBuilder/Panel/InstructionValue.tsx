import { FC } from 'react';
import Form from '../../SchemaForm/Form';
import Fieldset from '../../../layouts/Fieldset';
import { useTranslation } from 'next-i18next';

interface InstructionValueProps {
  instruction: string;
  value: any;
  schema?: any;
  onSubmit: (values: any) => void;
}

export const InstructionValue: FC<InstructionValueProps> = ({
  instruction,
  value,
  schema,
  onSubmit,
}) => {
  const { t } = useTranslation('workspaces');
  if (!schema) return null;
  return (
    <Fieldset legend={instruction} hasDivider={false}>
      <Form
        schema={schema}
        onSubmit={onSubmit}
        initialValues={value}
        description={t('automations.instruction.description', {
          context: instruction,
          default: schema.description,
        })}
      />
    </Fieldset>
  );
};

export default InstructionValue;
