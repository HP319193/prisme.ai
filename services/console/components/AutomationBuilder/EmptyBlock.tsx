import { FC, memo } from 'react';
import Image from 'next/image';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { useAutomationBuilder } from './context';
import plus from '../../icons/plus.svg';

export const EmptyBlock: FC<NodeProps> = ({ data = {}, id }) => {
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
          w-[260px]"
      >
        <div className="flex justify-center" style={{ minHeight: '1px' }}>
          {data.withButton && (
            <button
              className="flex items-center justify-center bg-graph-accent text-white rounded w-[1.625rem] h-[1.625rem] !rounded-[0.3rem]"
              onClick={() => {
                addInstruction(data.parent, data.index);
              }}
            >
              <Image src={plus.src} width={17} height={17} alt="" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(EmptyBlock);
