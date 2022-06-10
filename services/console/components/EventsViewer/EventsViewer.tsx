import { useTranslation } from 'react-i18next';
import { useWorkspace, WorkspaceContext } from '../../layouts/WorkspaceLayout';
import { useDateFormat } from '../../utils/dates';
import EventDetails from './EventDetails';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useScrollListener } from '../useScrollListener';
import useLocalizedText from '../../utils/useLocalizedText';
import {
  Collapse,
  Feed,
  Layout,
  Loading,
  Space,
} from '@prisme.ai/design-system';
import { Section } from '@prisme.ai/design-system/lib/Components/Feed';
import { CollapseItem } from '@prisme.ai/design-system/lib/Components/Collapse';
import { Event } from '@prisme.ai/sdk';
import Empty from './Empty';
import FilterEventsPopover from './FilterEventsPopover';
import { filterEmpty } from '../../utils/prismeAi';
import { ExceptionOutlined } from '@ant-design/icons';

export const EventsViewerRenderer = memo(function EventsViewerRender({
  events,
  nextEvents,
  readEvents,
  readEvent,
  filters,
}: Pick<
  WorkspaceContext,
  'events' | 'nextEvents' | 'readEvent' | 'readEvents' | 'filters'
>) {
  const { t } = useTranslation('workspaces');
  const dateFormat = useDateFormat();
  const { ref, bottom } = useScrollListener<HTMLDivElement>();
  const { workspace: { name: workspaceName } = {} } = useWorkspace();
  const { localize } = useLocalizedText('pages');

  useEffect(() => {
    if (bottom) {
      nextEvents();
    }
  }, [bottom, nextEvents]);

  const generateSectionContent = useCallback(
    (events: Set<Event<Date>>): CollapseItem[] =>
      Array.from(events).map((event) => ({
        key: event.id,
        label: (
          <div className="flex flex-col">
            <div
              className={`flex flex-row ${
                readEvents.has(event.id) ? 'opacity-50' : ''
              }`}
            >
              <div className="font-bold">
                {event.source?.appSlug || localize(workspaceName)}
              </div>
              <div className="text-gray font-thin ml-4">
                {dateFormat(event.createdAt, {
                  relative: true,
                })}
              </div>
            </div>
            <div className="font-normal">{event.type}</div>
          </div>
        ),
        content: <EventDetails {...event} />,
        onClick: () => {
          readEvent(event.id);
        },
      })),
    [dateFormat, localize, readEvent, readEvents, workspaceName]
  );

  const feedSections: Section[] = useMemo(
    () =>
      Array.from(events === 'loading' ? [] : events)
        .sort(([date1], [date2]) => date2 - date1)
        .map(([date, events]) => ({
          title: dateFormat(new Date(date), {
            relative: true,
            withoutHour: true,
          }),
          content: <Collapse items={generateSectionContent(events)} light />,
        })),
    [dateFormat, events, generateSectionContent]
  );

  const feedHeaderButtons = useMemo(
    () => [<FilterEventsPopover key="filterEvents" />],
    []
  );

  let content;
  if (events === 'loading') {
    content = <Loading />;
  } else if (feedSections.length === 0) {
    if (filterEmpty(filters)) {
      content = <Empty />;
    } else {
      content = (
        <div className="flex grow justify-center items-center">
          <div className="flex grow justify-center items-center flex-col">
            <ExceptionOutlined className="text-[50px] !text-gray mb-5" />
            {t('events.filters.empty')}
          </div>
        </div>
      );
    }
  } else {
    content = (
      <div className="w-full overflow-auto" ref={ref}>
        <Feed sections={feedSections} />
      </div>
    );
  }

  return (
    <Layout
      Header={
        <Space className="h-[70px] border border-gray-200 border-solid w-full !border-x-0">
          {feedHeaderButtons.map((button) => button)}
        </Space>
      }
      className="h-full"
    >
      <div className="flex h-full">{content}</div>
    </Layout>
  );
});

export const EventsViewer = () => {
  const { events, nextEvents, readEvents, readEvent, filters } = useWorkspace();

  return (
    <EventsViewerRenderer
      events={events}
      nextEvents={nextEvents}
      readEvents={readEvents}
      readEvent={readEvent}
      filters={filters}
    />
  );
};
export default EventsViewer;
