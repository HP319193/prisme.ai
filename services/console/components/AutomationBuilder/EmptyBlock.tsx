import { FC, memo } from "react";
import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { useAutomationBuilder } from "./context";

export const EmptyBlock: FC<NodeProps> = (({ data = {}, id, ...props }) => {
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
          flex-column
          w-10rem"
      >
        <div className="flex justify-content-center" style={{ minHeight: '1px' }}>
          {data.withButton &&
            <button
              className="pi pi-plus border-none bg-primary p-1 border-round z-1 text-xs cursor-pointer"
              onClick={() => {
                addInstruction(data.parent, data.index)
              }} />}
        </div>
      </div>
    </>
  );
});

export default memo(EmptyBlock)
