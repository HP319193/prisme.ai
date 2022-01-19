import { FC, memo } from "react";
import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { Block } from "./Block";
import { useAutomationBuilder } from "./context";
import styles from './styles'

export const Trigger: FC<NodeProps> = (props => {
  const { data } = props;
  const { editTrigger } = useAutomationBuilder();

  return (
    <>
      <Block {...props} removable={false} onEdit={editTrigger} />
      {!data.withButton && <Handle
        type="source"
        position={Position.Bottom}
        style={{ bottom: -4, ...styles.handle }}
      />}
    </>
  );
});

export default memo(Trigger)
