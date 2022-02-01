import Image from "next/image";
import useHover from '@react-hook/hover';
import { FC, memo, useCallback, useRef } from "react";
import { NodeProps } from 'react-flow-renderer'
import { Flow } from "./flow";
import { useAutomationBuilder } from "./context";
import { useTranslation } from "next-i18next";
import pencil from '../../icons/cursor-pencil.svg';
import { truncate } from "../../utils/strings";

interface BlockProps {
  removable?: boolean
  onEdit?: () => void;
}

export const Block: FC<NodeProps & BlockProps> = (({ data, removable = true, selected, onEdit, type }) => {
  const { t } = useTranslation('workspaces');
  const { removeInstruction, getApp } = useAutomationBuilder();
  const ref = useRef(null);
  const isHover = useHover(ref);
  const { icon, name } = getApp(data.label)

  const getLabel = useCallback(({ label, value }: { label: string, value: any }) => {
    switch (label) {
      case 'emit':
        return t('automations.node.label', {
          instruction: t('automations.instruction.label', { context: label }),
          value: (typeof value === 'string') ? value : value && value.event || '',
          display: ':'
        });
      case 'repeat':
        return t('automations.node.label', {
          instruction: t('automations.instruction.label', { context: label }),
          value: value && value.on || '?',
          display: ':'
        });
      case 'set':
        return t('automations.node.label', {
          instruction: t('automations.instruction.label', { context: label }),
          value: value && `${value.name} = ${truncate(value.value, 10, '…')}`,
          display: ':'
        });
      case 'delete':
        return t('automations.node.label', {
          instruction: t('automations.instruction.label', { context: label }),
          value: value && value.name || '?',
          display: ':'
        });
      case 'wait':
        return t('automations.node.label', {
          instruction: t('automations.instruction.label', { context: label }),
          value: value && value.event || '?',
          display: ':'
        });
      default:
        return t('automations.node.label', {
          instruction: t('automations.instruction.label', { context: label }),
          value: (typeof value === 'string') ? value : value && value.event || '',
          display: ':'
        });
    }
  }, [t])

  return (
    <>
      <div
        className={`
          flex
          flex-column
          surface-section
          border-solid
          border-${selected ? '3' : '1'}
          border-primary
          border-round`}
        style={{ width: Flow.BLOCK_WIDTH - 50 }}
        ref={ref}
      >
        <div className="
          flex
          align-items-center
          border-solid
          border-none
          border-bottom-1
          border-primary
          p-2
        ">
          <div className="mr-2">
            <Image src={icon} width={16} height={16} alt={name} />
          </div>
          <div className="flex flex-1 justify-content-between">
            {type === 'trigger' ? t('automations.trigger.title') : name}
            {removable && <button
              className="border-none cursor-pointer"
              style={{ background: 'none', visibility: isHover ? 'visible' : 'hidden' }}
              onClick={() => removeInstruction(data.parent, data.index)}>
              <div className="pi pi-times-circle" />
            </button>}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="
            flex
            justify-content-center
            p-2
          "
            style={{
              background: 'none',
              border: '0',
              fontSize: 'inherit',
              cursor: `url(${pencil.src}) 16 16, pointer`
            }}
          >
            {data.component ? <data.component /> : getLabel(data)}
          </button>
        )}
        {!onEdit && (
          <div className="
            flex
            justify-content-center
            p-2
            cursor-default">{getLabel(data)}</div>
        )}
      </div>
    </>
  );
});

export default memo(Block)
