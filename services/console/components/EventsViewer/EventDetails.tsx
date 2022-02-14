import { FC, useCallback, useMemo, MouseEvent } from 'react';
import { Table } from '@prisme.ai/design-system';
import { Event } from '../../api/types';
import { useDateFormat } from '../../utils/dates';
import { useTranslation } from 'next-i18next';
import { selectText } from '../../utils/dom';
import { truncate } from '../../utils/strings';

interface EventsDetailsProps extends Event<Date> {}

const PAYLOAD_TRUNCATE_LENGTH = 50;

const truncatePayload = (payloadValue: string) => {
  if (payloadValue && payloadValue.length > PAYLOAD_TRUNCATE_LENGTH) {
    return truncate(payloadValue, PAYLOAD_TRUNCATE_LENGTH);
  }
  return payloadValue;
};

export const EventDetails: FC<EventsDetailsProps> = (event) => {
  const { t } = useTranslation('workspaces');
  const formatDate = useDateFormat();
  const dataSource = useMemo(
    () => [
      {
        key: 'id',
        name: 'id',
        value: event.id,
      },
      {
        key: 'type',
        name: 'type',
        value: event.type,
      },
      {
        key: 'createdAt',
        name: 'createdAt',
        value: formatDate(event.createdAt, { format: 'yyyy-MM-dd hh:mm' }),
      },
      {
        key: 'source.app',
        name: 'source.app',
        value: event.source.app,
      },
      {
        key: 'source.userId',
        name: 'source.userId',
        value: event.source.userId,
      },
      {
        key: 'source.workspaceId',
        name: 'source.workspaceId',
        value: event.source.workspaceId,
      },
      {
        key: 'source.host.service',
        name: 'source.host.service',
        value: event.source.host.service,
      },
      {
        key: 'source.correlationId',
        name: 'source.correlationId',
        value: event.source.correlationId,
      },
      {
        key: 'payload',
        name: 'payload',
        value: (
          <pre>
            <code>
              {truncatePayload(JSON.stringify(event.payload, null, ' '))}
            </code>
          </pre>
        ),
        payloadValue: event.payload && (
          <pre>
            <code>{JSON.stringify(event.payload, null, ' ')}</code>
          </pre>
        ),
      },
      {
        key: 'error.error',
        name: 'error.error',
        value: event.error?.error,
      },
      {
        key: 'error.message',
        name: 'error.message',
        value: event.error?.message,
      },
      {
        key: 'error.details',
        name: 'error.details',
        value: event.error?.details && (
          <pre>
            <code>{JSON.stringify(event.error?.details, null, ' ')}</code>
          </pre>
        ),
      },
    ],
    [event, formatDate]
  );
  const onRowClick = useCallback(({ target }: MouseEvent) => {
    const valueTd = (
      target as HTMLTableRowElement
    ).parentNode?.querySelectorAll('td');
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
        rowExpandable: (record) => record.name === 'payload',
      }}
      expandRowByClick
      onRow={() => ({
        onClick: onRowClick,
      })}
    />
  );
};

export default EventDetails;
