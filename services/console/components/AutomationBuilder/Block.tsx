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
import { truncate } from '../../utils/strings';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import useLocalizedText from '../../utils/useLocalizedText';
import { Popconfirm } from 'antd';
import { useTracking } from '../Tracking';

interface BlockProps {
  removable?: boolean;
  onEdit?: () => void;
  displayAs?: 'trigger' | 'instruction' | 'output' | 'condition' | 'repeat';
}

interface BlockClassName {
  textClassName: string;
  bgClassName: string;
  borderClassName: string;
  selectedBorderClassName?: string;
  editTextClassName?: string;
}

interface BlockUI {
  editSection: ReactNode;
  topContent: ReactNode;
  selected: boolean;
  onEdit?: () => void;
  blockClassName: BlockClassName;
}

const CLASSNAME_BLOCKS: Record<string, BlockClassName> = {
  trigger: {
    textClassName: 'text-accent',
    bgClassName: 'bg-graph-background',
    borderClassName: 'border-graph-accent',
    selectedBorderClassName: 'border-graph-selected-accent',
  },
  instruction: {
    textClassName: '',
    bgClassName: 'bg-white',
    borderClassName: 'border-graph-border',
    selectedBorderClassName: 'border-pr-grey',
  },
  output: {
    textClassName: 'text-green-400',
    bgClassName: 'bg-green-200',
    borderClassName: 'border-green-400',
    selectedBorderClassName: 'border-green-100',
  },
  condition: {
    textClassName: '',
    editTextClassName: '!text-slate-400',
    bgClassName: 'bg-white',
    borderClassName: 'border-slate-300',
  },
};

const BlockUI = React.forwardRef(function BlockUI(
  { blockClassName, editSection, topContent, selected, onEdit }: BlockUI,
  ref: LegacyRef<HTMLDivElement> | undefined
) {
  return (
    <div
      className={`
          flex
          flex-col
          surface-section
          ${blockClassName.textClassName}
          ${blockClassName.bgClassName}
          ${
            (selected && blockClassName.selectedBorderClassName) ||
            blockClassName.borderClassName
          }
          border-[1px]
          ${selected ? 'drop-shadow-xl' : ''}
          transition-all ease
          rounded`}
      style={{ width: Flow.BLOCK_WIDTH - 40 }}
      ref={ref}
      onClick={onEdit}
    >
      <div
        className={`
          flex
          border-b-[1px]
          ${
            (selected && blockClassName.selectedBorderClassName) ||
            blockClassName.borderClassName
          }
          font-semibold
          p-[1.15rem]
          pb-3.5
        `}
      >
        {topContent}
      </div>
      <button
        className={`
          flex
          p-3.5
          justify-between
          items-center
          ${blockClassName.editTextClassName || ''}
          font-light
          overflow-hidden
          text-left
          `}
        style={{
          background: 'none',
          border: '0',
          fontSize: 'inherit',
          cursor: `pointer`,
        }}
      >
        {editSection}
        {onEdit ? <EditOutlined className="!text-accent" /> : null}
      </button>
    </div>
  );
});

export const Block: FC<NodeProps & BlockProps> = ({
  data,
  removable = true,
  selected,
  onEdit,
  displayAs,
}) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { removeInstruction, getApp } = useAutomationBuilder();
  const ref = useRef(null);
  const isHover = useHover(ref);
  const { icon, name, instructionName = '' } = getApp(data.label);
  const { trackEvent } = useTracking();

  const getLabel = useCallback(
    ({ label, value }: { label: string; value: any }) => {
      let displayedValue = '';
      switch (label) {
        case 'emit':
          if (value?.event) return <strong>{value.event}</strong>;
          return '…';
        case 'wait': {
          const events: string[] = (value?.oneOf || []).flatMap(
            ({ event }: { event: string }) => (event ? [event] : [])
          );
          if (value?.timeout !== undefined) {
            if (events.length)
              return (
                <strong>
                  {t('automations.instruction.label_wait_for_until', {
                    timeout: value.timeout,
                    events: events.join(', '),
                    count: events.length,
                  })}
                </strong>
              );
            return (
              <strong>
                {t('automations.instruction.label_wait_until', {
                  timeout: value.timeout,
                })}
              </strong>
            );
          }
          if (events.length)
            return (
              <strong>
                {t('automations.instruction.label_wait_for', {
                  events: events.join(', '),
                  count: events.length,
                })}
              </strong>
            );
          return '…';
        }
        case 'set':
          if (value?.name) {
            return (
              <strong>
                {value.name} ={' '}
                {truncate(JSON.stringify(value.value), 10, '…') || ''}
              </strong>
            );
          } else {
            return '…';
          }
        case 'delete':
          if (value?.name) {
            return <strong>{value.name}</strong>;
          }
          return '…';
        case 'repeat': {
          const values = [];
          if (value?.on) {
            values.push(
              t('automations.instruction.label', {
                context: 'repeat_on',
                on: value.on,
              })
            );
          }
          if (value?.until) {
            values.push(
              t('automations.instruction.label', {
                context: 'repeat_until',
                count: +value.until,
              })
            );
          }
          if (values.length > 0) {
            return <strong>{values.join(', ')}</strong>;
          } else {
            return '…';
          }
        }
        case 'comment':
          const actualValue =
            typeof value === 'string'
              ? value
              : JSON.stringify(value, null, '  ');
          displayedValue = truncate(actualValue, 150, '…');
          return (
            <div
              className="italic text-xs text-neutral-500"
              title={actualValue}
            >
              {displayedValue}
            </div>
          );
        case 'output':
          return (
            <Trans
              t={t}
              i18nKey="automations.output.label"
              components={{
                pre: <pre className="text-left font-sans" />,
                code: <span />,
                italic: <div className="text-gray-50 italic" />,
              }}
              values={{
                context: value.output ? 'json' : '',
                output: (
                  (typeof value.output === 'string'
                    ? value.output
                    : JSON.stringify(value.output, null, '  ')) || ''
                ).replaceAll('{{', '{\u200b{'),
              }}
            >
              output
            </Trans>
          );
        default:
          displayedValue =
            typeof value === 'string' ? value : (value && value.event) || '';
      }
      return (
        <div>
          <Trans
            t={t}
            i18nKey="automations.node.label"
            components={{
              strong: <strong />,
            }}
            values={{
              instruction: t('automations.instruction.label', {
                context: localize(instructionName) || label,
              }),
              value: displayedValue,
              display: ':',
              interpolation: {
                skipOnVariables: true,
              },
            }}
          >
            output
          </Trans>
        </div>
      );
    },
    [t, localize, instructionName]
  );

  return (
    <BlockUI
      ref={ref}
      blockClassName={
        (displayAs && CLASSNAME_BLOCKS[displayAs]) ||
        CLASSNAME_BLOCKS['instruction']
      }
      topContent={
        <>
          {icon && (
            <div className="mr-3 flex justify-center items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={icon}
                alt={name}
                className="object-contain h-[1rem] w-[1rem]"
              />
            </div>
          )}
          <div className="flex flex-1 justify-between">
            {data.title
              ? t('automations.node.title', { context: data.title })
              : data.label
              ? t('automations.instruction.label', { context: data.label })
              : name}
            {removable && (
              <Popconfirm
                title={t('automations.instruction.delete')}
                okText={t('yes', { ns: 'common' })}
                cancelText={t('no', { ns: 'common' })}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  trackEvent({
                    name: 'Delete Instruction',
                    action: 'click',
                  });
                  removeInstruction(data.parent, data.index);
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <button
                  className="border-none cursor-pointer flex justify-center items-center"
                  style={{
                    background: 'none',
                    visibility: isHover ? 'visible' : 'hidden',
                  }}
                  onClick={(e) => e?.stopPropagation()}
                  data-testid={`automation builder delete instruction ${data.index}`}
                >
                  <DeleteOutlined className="!text-orange-500" />
                </button>
              </Popconfirm>
            )}
          </div>
        </>
      }
      editSection={data.component ? <data.component /> : getLabel(data)}
      selected={selected}
      onEdit={() => {
        trackEvent({
          name: 'Display Instruction Edition',
          action: 'click',
        });
        onEdit?.();
      }}
    />
  );
};

export default memo(Block);
