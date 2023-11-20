import { FC, MouseEvent, useCallback, useMemo } from 'react';
import { Table, Tooltip } from '@prisme.ai/design-system';
import { Event } from '@prisme.ai/sdk';
import { useTranslation } from 'next-i18next';
import { selectText } from '../../utils/dom';
import { truncate } from '../../utils/strings';
import {
  FilterOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useWorkspace } from '../../providers/Workspace';
import { useQueryString } from '../../providers/QueryStringProvider';

interface EventsDetailsProps {
  event: Event<Date>;
}

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

export const EventDetails: FC<EventsDetailsProps & { replay: () => void }> = ({
  replay,
  event,
}) => {
  const { t } = useTranslation('workspaces');
  const { setQueryString } = useQueryString();
  const dataSource = useMemo(() => {
    const stringifiedPayload = JSON.stringify(event.payload, null, ' ');
    return [
      {
        key: 'type',
        name: 'type',
        value: event.type,
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
      {
        key: 'source.userId',
        name: 'source.userId',
        value: event.source.userId,
      },
      {
        key: 'source.sessionId',
        name: 'source.sessionId',
        value: event.source.sessionId,
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
      event.target
        ? {
            key: 'target',
            name: 'target',
            value: event.target && (
              <pre>
                <code>{JSON.stringify(event.target, null, ' ')}</code>
              </pre>
            ),
          }
        : false,
      {
        key: 'id',
        name: 'id',
        value: event.id,
      },
      {
        key: 'size',
        name: 'size',
        value: event.size,
      },
    ].filter(Boolean) as EventRecord[];
  }, [event]);
  const onRowClick = useCallback(({ target }: MouseEvent) => {
    const valueTd = (
      target as HTMLTableRowElement
    ).parentNode?.querySelectorAll('td');
    if (valueTd && valueTd.length === 3) {
      selectText(valueTd[2]);
    }
  }, []);

  const isEmit = event?.source?.serviceTopic === 'topic:runtime:emit';

  const addFilter = useCallback(
    (k: string, v: string) => {
      setQueryString((prev) => {
        const newQuery = new URLSearchParams(prev);
        newQuery.set(k, v);
        return newQuery;
      });
    },
    [setQueryString]
  );

  return (
    <div className="relative">
      <Table
        dataSource={dataSource}
        columns={[
          { title: t('events.details.name'), dataIndex: 'name', key: 'name' },
          {
            title: t('events.details.value'),
            dataIndex: 'value',
            key: 'value',
            render: (children, data) => {
              if (typeof children === 'object') return children;
              return (
                <>
                  {children}
                  <Tooltip title={t('events.details.addFilter')}>
                    <button
                      className="relative text-gray ml-2"
                      onClick={() => addFilter(data.name, data.value)}
                    >
                      <FilterOutlined />
                      <PlusCircleOutlined className="absolute bottom-0 -right-1 text-xs" />
                    </button>
                  </Tooltip>
                </>
              );
            },
          },
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
      {isEmit && (
        <Tooltip title={t('feed.replay')} placement="right">
          <button
            className="absolute top-[1.3rem] left-[1.3rem]"
            onClick={replay}
          >
            <PlayCircleOutlined />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export const LinkedEventDetails: FC<Event<Date>> = (event) => {
  const { events } = useWorkspace();
  const replay = useCallback(() => {
    events.emit(event.type, event.payload);
  }, [events, event.payload, event.type]);
  return useMemo(
    () => <EventDetails event={event} replay={replay} />,
    [event, replay]
  );
};

export default LinkedEventDetails;
