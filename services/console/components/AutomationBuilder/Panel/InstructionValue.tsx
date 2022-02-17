import { FC } from 'react';
import Form from '../../SchemaForm/Form';
import Fieldset from '../../../layouts/Fieldset';

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
  if (!schema) return null;
  return (
    <Fieldset legend={instruction} hasDivider={false}>
      <Form schema={schema} onSubmit={onSubmit} initialValues={value} />
    </Fieldset>
  );
};

export default InstructionValue;
