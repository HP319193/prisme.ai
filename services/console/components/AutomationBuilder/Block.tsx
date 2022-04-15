import Image from 'next/image';
import useHover from '@react-hook/hover';
import React, {
  FC,
  LegacyRef,
  memo,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { NodeProps } from 'react-flow-renderer';
import { Flow } from './flow';
import { useAutomationBuilder } from './context';
import { Trans, useTranslation } from 'next-i18next';
import pencil from '../../icons/cursor-pencil.svg';
import { truncate } from '../../utils/strings';
import { CloseCircleOutlined } from '@ant-design/icons';

interface BlockProps {
  removable?: boolean;
  onEdit?: () => void;
  type?: 'trigger' | 'instruction' | 'output';
}

interface BlockUI {
  editSection: ReactNode;
  topContent: ReactNode;
  selected: boolean;
  onEdit?: () => void;
}

// eslint-disable-next-line react/display-name
const TriggerBlockUI = React.forwardRef(
  (
    { editSection, topContent, selected, onEdit }: BlockUI,
    ref: LegacyRef<HTMLDivElement> | undefined
  ) => (
    <div
      className={`
          flex
          flex-col
          surface-section
          border-accent
          bg-graph-background
          ${selected ? 'border-4' : 'border-2'}
          text-accent
          rounded`}
      style={{ width: Flow.BLOCK_WIDTH - 50 }}
      ref={ref}
    >
      <div
        className="
          flex
          border-b-2
          border-accent
          font-bold
          p-2
        "
      >
        {topContent}
      </div>
      <button
        onClick={onEdit}
        className="
            flex
            p-2
          "
        style={{
          background: 'none',
          border: '0',
          fontSize: 'inherit',
          cursor: `url(${pencil.src}) 16 16, pointer`,
        }}
      >
        {editSection}
      </button>
    </div>
  )
);

export const Block: FC<NodeProps & BlockProps> = ({
  data,
  removable = true,
  selected,
  onEdit,
  type,
}) => {
  const { t } = useTranslation('workspaces');
  const { removeInstruction, getApp } = useAutomationBuilder();
  const ref = useRef(null);
  const isHover = useHover(ref);
  const { icon, name } = getApp(data.label);

  const getLabel = useCallback(
    ({ label, value }: { label: string; value: any }) => {
      let displayedValue = '';
      switch (label) {
        case 'emit':
          displayedValue =
            typeof value === 'string' ? value : (value && value.event) || '';
          break;
        case 'repeat':
          displayedValue = (value && value.on) || '?';
          break;
        case 'set':
          displayedValue =
            value && `${value.name} = ${truncate(value.value, 10, '…')}`;
          break;
        case 'delete':
          displayedValue = (value && value.name) || '?';
          break;
        case 'wait':
          displayedValue = (value && value.event) || '?';
          break;
        case 'output':
          return (
            <Trans
              t={t}
              i18nKey="automations.output.label"
              components={{
                pre: <pre className="text-left text-xs" />,
                code: <code />,
                italic: <div className="text-xs text-gray-50 italic" />,
              }}
              values={{
                context: value.output ? 'json' : 'empty',
                output: (
                  (typeof value.output === 'string'
                    ? value.output
                    : JSON.stringify(value.output, null, '  ')) || ''
                ).replaceAll('{{', '{\u200b{'),
              }}
            >
              Prout
            </Trans>
          );
        default:
          displayedValue =
            typeof value === 'string' ? value : (value && value.event) || '';
      }
      return t('automations.node.label', {
        instruction: t('automations.instruction.label', { context: label }),
        value: displayedValue,
        display: ':',
        interpolation: {
          skipOnVariables: true,
        },
      });
    },
    [t]
  );

  if (type === 'trigger') {
    return (
      <TriggerBlockUI
        topContent={
          <>
            {icon && (
              <div className="mr-2">
                <Image src={icon} width={16} height={16} alt={name} />
              </div>
            )}
            <div className="flex flex-1 justify-between">
              {data.title
                ? t('automations.node.title', { context: data.title })
                : name}
              {removable && (
                <button
                  className="border-none cursor-pointer"
                  style={{
                    background: 'none',
                    visibility: isHover ? 'visible' : 'hidden',
                  }}
                  onClick={() => removeInstruction(data.parent, data.index)}
                >
                  <CloseCircleOutlined />
                </button>
              )}
            </div>
          </>
        }
        editSection={
          <button
            onClick={onEdit}
            className="
            flex
            justify-center
          "
            style={{
              background: 'none',
              border: '0',
              fontSize: 'inherit',
              cursor: `url(${pencil.src}) 16 16, pointer`,
            }}
          >
            {data.component ? <data.component /> : getLabel(data)}
          </button>
        }
        selected={selected}
        onEdit={onEdit}
      />
    );
  }

  return (
    <>
      <div
        className={`
          flex
          flex-col
          surface-section
          border-graph-border
          bg-graph-background
          ${selected ? 'border-4' : 'border-2'}
          rounded`}
        style={{ width: Flow.BLOCK_WIDTH - 50 }}
        ref={ref}
      >
        <div
          className="
          flex
          align-center
          border-b-2
          border-graph-border
          p-2
        "
        >
          {icon && (
            <div className="mr-2">
              <Image src={icon} width={16} height={16} alt={name} />
            </div>
          )}
          <div className="flex flex-1 justify-between">
            {data.title
              ? t('automations.node.title', { context: data.title })
              : name}
            {removable && (
              <button
                className="border-none cursor-pointer"
                style={{
                  background: 'none',
                  visibility: isHover ? 'visible' : 'hidden',
                }}
                onClick={() => removeInstruction(data.parent, data.index)}
              >
                <CloseCircleOutlined />
              </button>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="
            flex
            justify-center
            p-2
          "
            style={{
              background: 'none',
              border: '0',
              fontSize: 'inherit',
              cursor: `url(${pencil.src}) 16 16, pointer`,
            }}
          >
            {data.component ? <data.component /> : getLabel(data)}
          </button>
        )}
        {!onEdit && (
          <div
            className="
            flex
            justify-center
            p-2
            cursor-default"
          >
            {getLabel(data)}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(Block);
