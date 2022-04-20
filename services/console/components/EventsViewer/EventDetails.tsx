import { FC, MouseEvent, useCallback, useMemo } from 'react';
import { Table } from '@prisme.ai/design-system';
import { Event } from '@prisme.ai/sdk';
import { useDateFormat } from '../../utils/dates';
import { useTranslation } from 'next-i18next';
import { selectText } from '../../utils/dom';
import { truncate } from '../../utils/strings';

interface EventsDetailsProps extends Event<Date> {}

const PAYLOAD_TRUNCATE_LENGTH = 400;

const truncatePayload = (payloadValue: string) => {
  if (payloadValue && payloadValue.length > PAYLOAD_TRUNCATE_LENGTH) {
    return truncate(payloadValue, PAYLOAD_TRUNCATE_LENGTH);
  }
  return payloadValue;
};

interface EventRecord {
  key: string;
  name: string;
  value: any;
  payloadValue: any;
  fullPayload: string;
}

export const EventDetails: FC<EventsDetailsProps> = (event) => {
  const { t } = useTranslation('workspaces');
  const dataSource = useMemo(() => {
    const stringifiedPayload = JSON.stringify(event.payload, null, ' ');
    return [
      {
        key: 'type',
        name: 'type',
        value: event.type,
      },
      {
        key: 'payload',
        name: 'payload',
        value: (
          <pre>
            <code>{truncatePayload(stringifiedPayload)}</code>
          </pre>
        ),
        payloadValue: event.payload && (
          <pre>
            <code>{stringifiedPayload}</code>
          </pre>
        ),
        fullPayload: stringifiedPayload,
      },
      event.source.appInstanceFullSlug
        ? {
            key: 'source.appInstanceFullSlug',
            name: 'source.appInstanceFullSlug',
            value: event.source.appInstanceFullSlug,
          }
        : false,
      event.source.automationSlug
        ? {
            key: 'source.automationSlug',
            name: 'source.automationSlug',
            value: event.source.automationSlug,
          }
        : false,
      {
        key: 'source.userId',
        name: 'source.userId',
        value: event.source.userId,
      },
      {
        key: 'source.correlationId',
        name: 'source.correlationId',
        value: event.source.correlationId,
      },
      event.error
        ? {
            key: 'error.error',
            name: 'error.error',
            value: event.error?.error,
          }
        : false,
      event.error
        ? {
            key: 'error.message',
            name: 'error.message',
            value: event.error?.message,
          }
        : false,
      event.error
        ? {
            key: 'error.details',
            name: 'error.details',
            value: event.error?.details && (
              <pre>
                <code>{JSON.stringify(event.error?.details, null, ' ')}</code>
              </pre>
            ),
          }
        : false,
      {
        key: 'id',
        name: 'id',
        value: event.id,
      },
    ].filter(Boolean) as EventRecord[];
  }, [event]);
  const onRowClick = useCallback(({ target }: MouseEvent) => {
    const valueTd = (target as HTMLTableRowElement).parentNode?.querySelectorAll(
      'td'
    );
    if (valueTd && valueTd.length === 3) {
      selectText(valueTd[2]);
    }
  }, []);

  return (
    <Table
      dataSource={dataSource}
      columns={[
        { title: t('events.details.name'), dataIndex: 'name', key: 'name' },
        { title: t('events.details.value'), dataIndex: 'value', key: 'value' },
      ]}
      bordered
      pagination={{ pageSize: 50, position: [] }}
      scroll={{ y: 500 }}
      expandable={{
        expandedRowRender: (record) => record.payloadValue,
        rowExpandable: (record) =>
          record.name === 'payload' &&
          !!record.fullPayload &&
          record.fullPayload.length > PAYLOAD_TRUNCATE_LENGTH,
      }}
      expandRowByClick
      onRow={() => ({
        onClick: onRowClick,
      })}
    />
  );
};

export default EventDetails;
