import { Trans, useTranslation } from 'next-i18next';
import { FC, memo, useMemo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import Block from './Block';
import { useAutomationBuilder } from './context';
import styles from './styles';
import { LinkOutlined } from '@ant-design/icons';
import { Button, notification } from '@prisme.ai/design-system';

interface TriggerDisplayProps {
  value: Prismeai.When;
  endpoint?: string;
}
export const TriggerDisplay: FC<TriggerDisplayProps> = ({
  value = {},
  endpoint = '',
}) => {
  const { t } = useTranslation('workspaces');

  const copyEndpoint = () => {
    globalThis.navigator.clipboard.writeText(endpoint);
    notification.success({
      message: t('automations.trigger.endpoint.copied'),
      placement: 'bottomRight',
    });
  };

  if (!endpoint && (!value.events || !value.events.length)) {
    return <div />;
  }

  return (
    <div className="text-xs">
      {value.events && value.events.length > 0 && (
        <div>
          {t('automations.trigger.events.display', {
            events: value.events,
            count: value.events.length,
          })}
        </div>
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
              a: (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyEndpoint();
                  }}
                  href={endpoint}
                  variant="primary"
                  className="pr-btn-primary-small !h-auto !text-[12px] !p-1 !px-2 !leading-none !pt-1"
                />
              ),
              icon: <LinkOutlined />,
            }}
          >
            <a>The endpoint</a> is hit
          </Trans>
        </div>
      )}
    </div>
  );
};

export const TriggerBlock: FC<NodeProps> = (props) => {
  const { data } = props;
  const { editTrigger } = useAutomationBuilder();
  const triggerData = useMemo(
    () => ({
      ...data,
      component: () => <TriggerDisplay {...data} endpoint={data.endpoint} />,
    }),
    [data]
  );

  return (
    <>
      <Block
        {...props}
        data={triggerData}
        removable={false}
        onEdit={editTrigger}
        displayAs="trigger"
      />
      {!data.withButton && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ bottom: -4, ...styles.handle }}
        />
      )}
    </>
  );
};

export default memo(TriggerBlock);
