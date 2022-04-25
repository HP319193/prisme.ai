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
import { truncate } from '../../utils/strings';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

interface BlockProps {
  removable?: boolean;
  onEdit?: () => void;
  displayAs?: 'trigger' | 'instruction' | 'output' | 'condition' | 'repeat';
}

interface BlockClassName {
  textClassName: string;
  bgClassName: string;
  borderClassName: string;
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
    borderClassName: 'border-accent',
  },
  instruction: {
    textClassName: '',
    bgClassName: 'bg-white',
    borderClassName: 'border-slate-300',
  },
  output: {
    textClassName: 'text-green-400',
    bgClassName: 'bg-green-200',
    borderClassName: 'border-green-400',
  },
  condition: {
    textClassName: '',
    editTextClassName: '!text-slate-400',
    bgClassName: 'bg-white',
    borderClassName: 'border-slate-300',
  },
};

// eslint-disable-next-line react/display-name
const BlockUI = React.forwardRef(
  (
    { blockClassName, editSection, topContent, selected, onEdit }: BlockUI,
    ref: LegacyRef<HTMLDivElement> | undefined
  ) => (
    <div
      className={`
          flex
          flex-col
          surface-section
          ${blockClassName.textClassName}
          ${blockClassName.bgClassName}
          ${blockClassName.borderClassName}
          border-[1px]
          ${selected ? 'drop-shadow-xl' : ''}
          transition-all ease
          rounded`}
      style={{ width: Flow.BLOCK_WIDTH - 50 }}
      ref={ref}
      onClick={onEdit}
    >
      <div
        className={`
          flex
          border-b-[1px]
          ${blockClassName.borderClassName}
          font-bold
          p-2
        `}
      >
        {topContent}
      </div>
      <button
        className={`
          flex
          p-2
          justify-between
          items-center
          ${blockClassName.editTextClassName || ''}
          `}
        style={{
          background: 'none',
          border: '0',
          fontSize: 'inherit',
          cursor: `pointer`,
        }}
      >
        {editSection}
        {onEdit ? <EditOutlined /> : null}
      </button>
    </div>
  )
);

export const Block: FC<NodeProps & BlockProps> = ({
  data,
  removable = true,
  selected,
  onEdit,
  displayAs,
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
          if (!value) {
            displayedValue = '?';
          }
          if (value.on) {
            displayedValue = value.on;
          }
          if (value.until) {
            return t('automations.instruction.label', {
              context: 'repeat_until',
              count: +value.until,
            });
          }
          displayedValue = (value && value.on) || value.until || '?';
          break;
        case 'set':
          displayedValue =
            value &&
            `${value.name} = ${truncate(JSON.stringify(value.value), 10, '…')}`;
          break;
        case 'delete':
          displayedValue = (value && value.name) || '?';
          break;
        case 'wait':
          displayedValue = (value && value.event) || '?';
          break;
        case 'comment':
          return (
            <div className="italic text-neutral-500">
              {typeof value === 'string'
                ? value
                : JSON.stringify(value, null, '  ')}
            </div>
          );
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
              output
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
                <DeleteOutlined className="!text-orange-500" />
              </button>
            )}
          </div>
        </>
      }
      editSection={data.component ? <data.component /> : getLabel(data)}
      selected={selected}
      onEdit={onEdit}
    />
  );
};

export default memo(Block);
