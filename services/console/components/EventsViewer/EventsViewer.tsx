import { useTranslation } from 'react-i18next';
import { useDateFormat } from '../../utils/dates';
import EventDetails from './EventDetails';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useScrollListener } from '../useScrollListener';
import useLocalizedText from '../../utils/useLocalizedText';
import {
  Button,
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
  workspaceName,
}: Pick<
  WorkspaceContext,
  'events' | 'nextEvents' | 'readEvent' | 'readEvents' | 'filters'
> & { workspaceName?: Prismeai.LocalizedText }) {
  const { t } = useTranslation('workspaces');
  const dateFormat = useDateFormat();
  const { ref, bottom } = useScrollListener<HTMLDivElement>({ margin: -1 });
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
              event={event}
            />
          </SourceDetails>
        ),
        content: <EventDetails {...event} />,
      })),
    [dateFormat, localize, readEvents, workspaceName]
  );

  const feedSections: Section[] = useMemo(
    () =>
      Array.from(events === 'loading' ? [] : events)
        .sort(([date1], [date2]) => date2 - date1)
        .map(([date, events]) => ({
          title: (
            dateFormat(new Date(date), {
              relative: true,
              withoutHour: true,
            }) || ''
          ).toUpperCase(),
          content: (
            <Collapse
              items={generateSectionContent(events)}
              light
              onChange={(ids) => {
                const id = ids[0];
                if (!id) return;
                readEvent(id);
              }}
            />
          ),
        })),
    [dateFormat, events, generateSectionContent, readEvent]
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
      <div className="w-full">
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
      <div className="flex h-full overflow-auto flex-col" ref={ref}>
        {content}
        <Button onClick={nextEvents}>{t('events.more')}</Button>
      </div>
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
    workspace: { name: workspaceName } = {},
  } = useWorkspace();

  useEffect(() => {
    setShare({
      label: t('workspace.share'),
      component: ShareWorkspace,
    });
  }, [setShare, t]);

  const [props, setProps] = useState({
    events,
    nextEvents,
    readEvents,
    readEvent,
    filters,
    workspaceName,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setProps({
        events,
        nextEvents,
        readEvents,
        readEvent,
        filters,
        workspaceName,
      });
    }, 10);
    return () => {
      clearTimeout(t);
    };
  }, [events, nextEvents, readEvents, readEvent, filters, workspaceName]);

  return <EventsViewerRenderer {...props} />;
};
export default EventsViewer;
