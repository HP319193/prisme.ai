import React, { FC } from 'react';
import { EdgeProps, getEdgeCenter } from 'react-flow-renderer';
import { useAutomationBuilder } from './context';
import Edge from './Edge';
import { PlusOutlined } from '@ant-design/icons';

const foreignObjectSize = 40;

export const InstructionEdge: FC<EdgeProps> = (props) => {
  const { addInstruction } = useAutomationBuilder();
  const { sourceX, sourceY, targetX, targetY, data } = props;

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
          className="flex justify-center align-center"
          style={{ height: `${foreignObjectSize}px` }}
        >
          <button
            className="bg-graph-accent text-white rounded w-10 h-10"
            onClick={() => addInstruction(data.parent, data.index)}
          >
            <PlusOutlined />
          </button>
        </div>
      </foreignObject>
    </Edge>
  );
};

export default InstructionEdge;
