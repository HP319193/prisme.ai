import { Trans, useTranslation } from "next-i18next";
import { FC, memo, useMemo } from "react";
import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { useToaster } from "../../layouts/Toaster";
import Block from "./Block";
import { useAutomationBuilder } from "./context";
import styles from './styles'

interface TriggerDisplayProps {
  value: Prismeai.When;
  endpoint?: string;
}
export const TriggerDisplay: FC<TriggerDisplayProps> = ({ value = {}, endpoint = '' }) => {
  const { t } = useTranslation('workspaces');
  const toaster = useToaster();

  const copyEndpoint = () => {
    globalThis.navigator.clipboard.writeText(endpoint)
    toaster.show({
      severity: 'success',
      summary: t('automations.trigger.endpoint.copied')
    })
  }

  return (
    <div className="text-xs">
      {value.events && value.events.length && (
        <div>
          {t('automations.trigger.events.display', {
            events: value.events,
            count: value.events.length
          })}</div>
      )}
      {endpoint && (
        <div>
          <Trans
            t={t}
            i18nKey="automations.trigger.endpoint.display"
            values={{
              url: endpoint,
            }}
            components={{
              a: <a
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  copyEndpoint()
                }}
                href={endpoint} />,
              icon: <i className="pi pi-copy" />
            }}>
            <a>The endpoint</a> is hit
          </Trans>
        </div>
      )}
    </div >
  )
}

export const Trigger: FC<NodeProps> = (props => {
  const { data } = props;
  const { editTrigger } = useAutomationBuilder();
  const triggerData = useMemo(() => ({
    ...data,
    component: () => <TriggerDisplay {...data} endpoint={data.endpoint} />
  }), [data])

  return (
    <>
      <Block {...props} data={triggerData} removable={false} onEdit={editTrigger} />
      {!data.withButton && <Handle
        type="source"
        position={Position.Bottom}
        style={{ bottom: -4, ...styles.handle }}
      />}
    </>
  );
});

export default memo(Trigger)
