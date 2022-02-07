import { FC, memo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import Block from './Block';
import { useAutomationBuilder } from './context';
import styles from './styles';

export const Instruction: FC<NodeProps> = (props) => {
  const { data } = props;
  const { editInstruction } = useAutomationBuilder();

  return (
    <>
      <Handle type="target" position={Position.Top} style={styles.handle} />
      <Block
        {...props}
        onEdit={() => editInstruction(data.parent, data.index)}
      />
      <Handle type="source" position={Position.Bottom} style={styles.handle} />
    </>
  );
};

export default memo(Instruction);
