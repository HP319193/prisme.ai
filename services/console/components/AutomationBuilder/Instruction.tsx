import { FC, memo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import Block from './Block';
import { useAutomationBuilder } from './context';
import styles from './styles';
import { instructionHasForm } from './utils';

export const Instruction: FC<NodeProps> = (props) => {
  const { data } = props;
  const { editInstruction, getSchema } = useAutomationBuilder();

  const hasProperties = instructionHasForm(data.label, getSchema(data.label));

  return (
    <>
      <Block
        {...props}
        displayAs="instruction"
        onEdit={
          hasProperties
            ? () => editInstruction(data.parent, data.index)
            : undefined
        }
      />
      <Handle type="source" position={Position.Bottom} style={styles.handle} />
    </>
  );
};

export default memo(Instruction);
