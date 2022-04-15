import { FC, memo, useEffect, useMemo } from 'react';
import {
  Handle,
  NodeProps,
  Position,
  useUpdateNodeInternals,
} from 'react-flow-renderer';
import Block from './Block';
import { Flow } from './flow';
import styles from './styles';

export const Conditions: FC<NodeProps> = (props) => {
  const { data, id } = props;
  const sources = useMemo(
    () => [...Object.keys(data.value || []), Flow.NEW_CONDITION],
    [data]
  );
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, sources, updateNodeInternals]);

  return (
    <>
      <Handle type="target" position={Position.Top} style={styles.handle} />
      <Block {...props} type="condition" />
      <div className="flex justify-between" style={{ padding: '0 10px' }}>
        {sources.map((key) => (
          <Handle
            key={key}
            id={key}
            type="source"
            position={Position.Bottom}
            style={{
              ...styles.handle,
              display: 'flex',
              position: 'relative',
              left: 'auto',
              bottom: '5px',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default memo(Conditions);
