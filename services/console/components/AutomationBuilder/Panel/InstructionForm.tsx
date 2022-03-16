import { FC, useCallback, useEffect, useState } from 'react';
import InstructionSelection from './InstructionSelection';
import InstructionValue from './InstructionValue';
import { Schema } from '../../SchemaForm/types';
import { useAutomationBuilder } from '../context';
import { ArrowLeftOutlined } from '@ant-design/icons';

const getDefaultValue = (type: string) => {
  switch (type) {
    case 'array':
      return [];
    case 'object':
    default:
      return {};
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
      const schema = getSchema(instructionName);
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

  useEffect(() => {
    const [currentInstruction] = Object.keys(instruction || {});
    setEdit({
      instruction: currentInstruction,
      value:
        currentInstruction &&
        instruction &&
        instruction[currentInstruction as keyof typeof instruction],
      schema: getSchema(currentInstruction),
    });
  }, [getSchema, instruction, setInstruction]);

  const setInstructionValue = useCallback(
    (values: any) => {
      if (!edit.instruction) return;
      onSubmit({
        [edit.instruction]: values,
      });
    },
    [edit.instruction, onSubmit]
  );

  const unsetInstruction = useCallback(() => {
    setEdit({
      instruction: '',
      value: {},
      schema: null,
    });
  }, []);

  return (
    <div className="flex flex-1 flex-col h-full overflow-x-auto">
      {!instruction && edit.instruction && (
        <button
          onClick={unsetInstruction}
          className="absolute top-[24px] left-[1rem]"
        >
          <ArrowLeftOutlined />
        </button>
      )}
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
