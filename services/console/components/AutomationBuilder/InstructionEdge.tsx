import React, { FC } from 'react';
import {
  EdgeProps,
  getEdgeCenter,
} from 'react-flow-renderer';
import { useAutomationBuilder } from './context';
import Edge from './Edge';

const foreignObjectSize = 40;

export const InstructionEdge: FC<EdgeProps> = (props) => {
  const { addInstruction } = useAutomationBuilder();
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    data
  } = props

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <Edge {...props}>

      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          className="flex justify-content-center align-items-center"
          style={{ height: `${foreignObjectSize}px` }}>
          <button
            className="pi pi-plus border-none bg-primary p-1 border-round z-1 text-xs cursor-pointer"
            onClick={() => addInstruction(data.parent, data.index)} />
        </div>
      </foreignObject>
    </Edge>
  );
}

export default InstructionEdge
