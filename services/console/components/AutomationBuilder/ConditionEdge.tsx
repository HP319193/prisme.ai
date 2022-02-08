import React, { FC } from 'react';
import {
  EdgeProps,
  getMarkerEnd,
  getSmoothStepPath,
} from 'react-flow-renderer';
import { useAutomationBuilder } from './context';

export const ConditionEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {
    strokeDasharray: '5, 5',
  },
  data,
  arrowHeadType,
  markerEndId,
}) => {
  const { editCondition } = useAutomationBuilder();
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data && (
        <foreignObject
          width={200}
          height={40}
          x={targetX - 100}
          y={targetY - 55}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            className="flex justify-center align-center"
            style={{ height: `${40}px` }}
          >
            <button
              className={`
                border-none bg-primary p-1 border-round z-1 text-xs
                ${data.parent ? 'cursor-pointer' : ''}
                `}
              onClick={
                data.parent && (() => editCondition(data.parent, data.key))
              }
            >
              {data.label}
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default ConditionEdge;
