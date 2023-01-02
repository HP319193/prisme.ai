import { FC, useCallback, useEffect, useState } from 'react';
import InstructionSelection from './InstructionSelection';
import InstructionValue from './InstructionValue';
import { useAutomationBuilder } from '../context';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Schema } from '@prisme.ai/design-system';
import { instructionHasForm } from '../utils';

const getDefaultValue = (type: string) => {
  switch (type) {
    case 'array':
      return [];
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object':
    default:
      return {};
  }
};
interface InstructionFormProps {
  instruction?: Prismeai.Instruction;
  onChange: (i: Prismeai.Instruction) => void;
  onSubmit: (i: Prismeai.Instruction) => void;
}

export const InstructionForm: FC<InstructionFormProps> = ({
  instruction,
  onChange,
  onSubmit,
}) => {
  const { getSchema } = useAutomationBuilder();
  const [currentInstruction] = Object.keys(instruction || {});
  const [edit, setEdit] = useState<{
    instruction: string;
    value: any;
    schema: Schema | null;
  } | null>({
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
      if (!instructionHasForm(instructionName, schema)) {
        onSubmit({
          [instructionName]: getDefaultValue(schema.type || ''),
        });
        return;
      }

      setEdit({
        instruction: instructionName,
        value: getDefaultValue(schema.type || ''),
        schema,
      });
      onChange({
        [instructionName]: {},
      });
    },
    [getSchema, onChange, onSubmit]
  );

  useEffect(() => {
    const [currentInstruction] = Object.keys(instruction || {});
    // force a unmount of Form to refresh initialValue
    setEdit(null);
    setTimeout(() => {
      setEdit({
        instruction: currentInstruction,
        value:
          currentInstruction &&
          instruction &&
          instruction[currentInstruction as keyof typeof instruction],
        schema: {
          type: 'object',
          ...getSchema(currentInstruction),
        },
      });
    });
  }, [getSchema, instruction, setInstruction]);

  const setInstructionValue = useCallback(
    (values: any) => {
      if (!edit || !edit.instruction) return;
      onChange({
        [edit.instruction]: values,
      });
    },
    [edit, onChange]
  );

  const unsetInstruction = useCallback(() => {
    setEdit({
      instruction: '',
      value: {},
      schema: null,
    });
  }, []);

  return (
    <div className="flex flex-1 h-full flex-col">
      {!instruction && edit && edit.instruction && (
        <button
          onClick={unsetInstruction}
          className="absolute top-[24px] left-[1rem]"
        >
          <ArrowLeftOutlined />
        </button>
      )}
      {edit && !edit.instruction && (
        <div className="flex flex-1 flex-col m-4">
          <InstructionSelection onSubmit={setInstruction} />
        </div>
      )}
      {edit && edit.instruction && (
        <InstructionValue
          instruction={edit.instruction}
          value={edit.value}
          schema={edit.schema}
          onChange={setInstructionValue}
        />
      )}
    </div>
  );
};

export default InstructionForm;
