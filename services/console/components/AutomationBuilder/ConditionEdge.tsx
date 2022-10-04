import React, { FC, useMemo, useRef } from 'react';
import {
  EdgeProps,
  getMarkerEnd,
  getSmoothStepPath,
} from 'react-flow-renderer';
import { useAutomationBuilder } from './context';
import { Flow } from './flow';
import { useTranslation } from 'react-i18next';
import useHover from '@react-hook/hover';
import { DeleteOutlined } from '@ant-design/icons';

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
  const { editCondition, removeCondition } = useAutomationBuilder();
  const { t } = useTranslation('workspaces');
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  const ref = useRef(null);
  const isHover = useHover(ref);

  const dataLabel = (data || {}).label;

  const displayedLabel = useMemo(() => {
    switch (dataLabel) {
      case 'default':
        return t('automations.instruction.label_conditions_default');
      case Flow.NEW_CONDITION:
        return t('automations.instruction.label_conditions_add');
      default:
        return dataLabel;
    }
  }, [t, dataLabel]);

  const removable = data && data.key && !['', 'default'].includes(data.key);

  return (
    <>
      <path
        id={id}
        style={{ ...style, strokeDasharray: '5,5' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data && (
        <foreignObject
          width={200}
          height={40}
          x={targetX - 100}
          y={targetY - 75}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            className="flex justify-center align-center"
            style={{ height: `${40}px` }}
            ref={ref}
          >
            <button
              className={`
                bg-graph-accent p-1 rounded z-1 text-xs min-w-sm text-white px-4
                ${data.parent ? 'cursor-pointer' : ''}
                `}
              onClick={
                data.parent && (() => editCondition(data.parent, data.key))
              }
            >
              {displayedLabel}
            </button>
            {removable && (
              <button
                className="border-none cursor-pointer flex justify-center items-center"
                style={{
                  background: 'none',
                  visibility: isHover ? 'visible' : 'hidden',
                }}
                onClick={() => removeCondition(data.parent, data.key)}
              >
                <DeleteOutlined className="!text-orange-500" />
              </button>
            )}
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default ConditionEdge;
