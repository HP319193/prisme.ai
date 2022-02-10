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
        name: 'id',
        value: event.id,
      },
      {
        name: 'type',
        value: event.type,
      },
      {
        name: 'createdAt',
        value: formatDate(event.createdAt, { format: 'yyyy-MM-dd hh:mm' }),
      },
      {
        name: 'source.app',
        value: event.source.app,
      },
      {
        name: 'source.userId',
        value: event.source.userId,
      },
      {
        name: 'source.workspaceId',
        value: event.source.workspaceId,
      },
      {
        name: 'source.host.service',
        value: event.source.host.service,
      },
      {
        name: 'source.correlationId',
        value: event.source.correlationId,
      },
      {
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
        name: 'error.error',
        value: event.error?.error,
      },
      {
        name: 'error.message',
        value: event.error?.message,
      },
      {
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
