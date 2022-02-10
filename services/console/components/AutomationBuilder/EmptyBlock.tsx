import { PlusOutlined } from '@ant-design/icons';
import { FC, memo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { useAutomationBuilder } from './context';

export const EmptyBlock: FC<NodeProps> = ({ data = {}, id, ...props }) => {
  const { addInstruction } = useAutomationBuilder();

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: 'hidden' }}
      />
      <div
        className="
          flex
          flex-col
          w-[250px]"
      >
        <div className="flex justify-center" style={{ minHeight: '1px' }}>
          {data.withButton && (
            <button
              className="bg-graph-accent text-white rounded w-10 h-10"
              onClick={() => {
                addInstruction(data.parent, data.index);
              }}
            >
              <PlusOutlined />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(EmptyBlock);
