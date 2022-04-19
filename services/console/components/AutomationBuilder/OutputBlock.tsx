import { FC, memo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import Block from './Block';
import { useAutomationBuilder } from './context';
import styles from './styles';

export const OutputBlock: FC<NodeProps> = (props) => {
  const { data } = props;
  const { editOutput } = useAutomationBuilder();

  return (
    <>
      <Handle
        type="source"
        position={Position.Top}
        style={{ bottom: -4, ...styles.handle }}
      />
      <Block
        {...props}
        displayAs="output"
        data={{ ...data, label: 'output' }}
        removable={false}
        onEdit={editOutput}
      />
    </>
  );
};

export default memo(OutputBlock);
