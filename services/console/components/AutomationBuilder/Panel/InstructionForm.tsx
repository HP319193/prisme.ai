import { FC, useCallback, useState } from 'react';
import InstructionSelection from './InstructionSelection';
import InstructionValue from './InstructionValue';
import { Schema } from '../../SchemaForm/types';
import { useAutomationBuilder } from '../context';

const getDefaultValue = (type: string) => {
  switch (type) {
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return undefined;
  }
};
interface InstructionFormProps {
  instruction?: Prismeai.Instruction;
  onSubmit: (i: Prismeai.Instruction) => void;
}

export const InstructionForm: FC<InstructionFormProps> = ({
  instruction,
  onSubmit,
}) => {
  const { getSchema } = useAutomationBuilder();
  const [currentInstruction] = Object.keys(instruction || {});
  const [edit, setEdit] = useState<{
    instruction: string;
    value: any;
    schema: Schema | null;
  }>({
    instruction: currentInstruction,
    value:
      currentInstruction &&
      instruction &&
      instruction[currentInstruction as keyof typeof instruction],
    schema: getSchema(currentInstruction),
  });

  const setInstruction = useCallback(
    (instructionName: string) => {
      const schema = getSchema(instructionName.toLowerCase());

      if (!schema.properties) {
        onSubmit({
          [instructionName]: getDefaultValue(schema.type || ''),
        });
        return;
      }
      setEdit({
        instruction: instructionName,
        value: {},
        schema,
      });
    },
    [getSchema, onSubmit]
  );

  const setInstructionValue = useCallback(
    (values: any) => {
      if (!edit.instruction) return;
      onSubmit({
        [edit.instruction]: values,
      });
    },
    [edit.instruction, onSubmit]
  );

  return (
    <div className="flex flex-1 flex-column">
      {!edit ||
        (!edit.instruction && (
          <InstructionSelection onSubmit={setInstruction} />
        ))}
      {edit && edit.instruction && (
        <InstructionValue
          instruction={edit.instruction}
          value={edit.value}
          schema={edit.schema}
          onSubmit={setInstructionValue}
        />
      )}
    </div>
  );
};

export default InstructionForm;
