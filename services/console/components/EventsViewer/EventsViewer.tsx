import { useTranslation } from 'react-i18next';
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
import { useWorkspace, WorkspaceContext } from '../WorkspaceProvider';
import ShareWorkspace from '../Share/ShareWorkspace';
import SourceDetails from '../SourceDetails';
import SectionContent from './SectionContent';

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
  console.log(events);
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
          <SourceDetails
            workspaceId={event.source.workspaceId}
            appSlug={event.source.appSlug}
          >
            <SectionContent
              title={event.source?.appSlug || localize(workspaceName)}
              date={dateFormat(event.createdAt, {
                relative: true,
              })}
              type={event.type}
              read={readEvents.has(event.id)}
            />
          </SourceDetails>
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
        <div className="flex flex-1 justify-center items-center">
          <div className="flex flex-1 justify-center items-center flex-col">
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
  const { t } = useTranslation('workspaces');
  const {
    setShare,
    events,
    nextEvents,
    readEvents,
    readEvent,
    filters,
  } = useWorkspace();

  useEffect(() => {
    setShare({
      label: t('workspace.share'),
      component: ShareWorkspace,
    });
  }, [setShare, t]);

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
