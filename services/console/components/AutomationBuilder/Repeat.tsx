import { FC, memo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import Block from './Block';
import styles from './styles';

export const Repeat: FC<NodeProps> = (props) => {
  const { data } = props;
  return (
    <>
      <Block blockType="repeat" {...props} />
      {!data.edges && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={styles.handle}
        />
      )}
      <Handle
        type="source"
        id="1"
        style={styles.handle}
        position={Position.Bottom}
      />
      <div
        className="absolute right-0"
        style={{ padding: '0 10px', marginTop: '-9px' }}
      >
        <Handle
          id="0"
          type="source"
          position={Position.Bottom}
          style={{
            display: 'flex',
            position: 'relative',
            left: 'auto',
            ...styles.handle,
          }}
        />
      </div>
      <div
        className="absolute right-0"
        style={{ padding: '0 10px', marginTop: '-9px' }}
      >
        <Handle
          type="target"
          id="2"
          position={Position.Bottom}
          style={{
            display: 'flex',
            position: 'relative',
            left: 'auto',
            ...styles.handle,
          }}
        />
      </div>
    </>
  );
};

export default memo(Repeat);
