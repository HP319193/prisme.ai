import { Trans, useTranslation } from 'next-i18next';
import { FC, memo, useMemo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import Block from './Block';
import { useAutomationBuilder } from './context';
import styles from './styles';
import { LinkOutlined } from '@ant-design/icons';
import { Button, notification } from '@prisme.ai/design-system';
import { truncate } from '../../utils/strings';
import { useTracking } from '../Tracking';

interface TriggerDisplayProps {
  value: Prismeai.When;
  endpoint?: string;
}
export const TriggerDisplay: FC<TriggerDisplayProps> = ({
  value = {} as Prismeai.When,
  endpoint = '',
}) => {
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();

  const copyEndpoint = () => {
    globalThis.navigator.clipboard.writeText(endpoint);
    notification.success({
      message: t('automations.trigger.endpoint.copied'),
      placement: 'bottomRight',
    });
  };
  const { schedules, events } = value;

  if (
    !endpoint &&
    (!events || !events.length) &&
    (!schedules || !schedules.length)
  ) {
    return <div />;
  }

  return (
    <div>
      {events && events.length > 0 && (
        <div>
          {t('automations.trigger.events.display', {
            events: events.map((event) => truncate(event, 10)),
            count: events.length,
          })}
        </div>
      )}
      {endpoint && (
        <div className="flex items-center justify-start">
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
                    trackEvent({
                      name: 'Copy endpoint',
                      action: 'click',
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    copyEndpoint();
                  }}
                  href={endpoint}
                  variant="primary"
                  className="pr-btn-primary-small !h-auto !text-[12px] !p-1.5 !px-2 !leading-none !rounded-[0.7rem] align-bottom mr-2"
                />
              ),
              icon: <LinkOutlined />,
            }}
          >
            <a>The endpoint</a> is hit
          </Trans>
        </div>
      )}
      {schedules && schedules.length > 0 && (
        <div>
          {t('automations.trigger.schedules.display', {
            count: schedules.length,
          })}
        </div>
      )}
    </div>
  );
};

export const TriggerBlock: FC<NodeProps> = (props) => {
  const { data } = props;
  const { editTrigger } = useAutomationBuilder();
  const { trackEvent } = useTracking();
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
        onEdit={() => {
          trackEvent({
            name: 'Display Trigger Edition',
            action: 'click',
          });
          editTrigger();
        }}
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
