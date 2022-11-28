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
  StretchContent,
} from '@prisme.ai/design-system';
import { Section } from '@prisme.ai/design-system/lib/Components/Feed';
import { CollapseItem } from '@prisme.ai/design-system/lib/Components/Collapse';
import { Event } from '@prisme.ai/sdk';
import Empty from './Empty';
import { ExceptionOutlined } from '@ant-design/icons';
import { useWorkspace, WorkspaceContext } from '../WorkspaceProvider';
import ShareWorkspace from '../Share/ShareWorkspace';
import SourceDetails from '../SourceDetails';
import SectionContent from './SectionContent';
import { Badge, PageHeader } from 'antd';
import HorizontalSeparatedNav from '../HorizontalSeparatedNav';
import Filters from './Filters';
import { useQueryString } from '../QueryStringProvider';

export const EventsViewerRenderer = memo(function EventsViewerRender({
  events,
  nextEvents,
  readEvents,
  readEvent,
  filters,
  updateFilters,
  workspaceName,
}: Pick<
  WorkspaceContext,
  | 'events'
  | 'nextEvents'
  | 'readEvent'
  | 'readEvents'
  | 'filters'
  | 'updateFilters'
> & { workspaceName?: Prismeai.LocalizedText }) {
  const { t } = useTranslation('workspaces');
  const dateFormat = useDateFormat();
  const { ref, bottom } = useScrollListener<HTMLDivElement>({ margin: -1 });
  const { localize } = useLocalizedText('pages');
  const { queryString, setQueryString } = useQueryString();
  const filtersCount = Array.from(queryString.entries()).filter(
    ([key]) => key !== 'text'
  ).length;
  const [showFilters, setShowFilters] = useState(filtersCount > 0);

  const updateQuery = useCallback(
    (text: string) => {
      setQueryString((prevQuery) => {
        const newQuery = new URLSearchParams(prevQuery);
        if (text) {
          newQuery.set('text', text);
        } else {
          newQuery.delete('text');
        }

        if (newQuery.toString() === prevQuery.toString()) return prevQuery;
        return newQuery;
      });
    },
    [setQueryString]
  );

  useEffect(() => {
    if (bottom) {
      nextEvents();
    }
  }, [bottom, nextEvents]);

  useEffect(() => {
    const t = setTimeout(() => {
      const query = Array.from(queryString.entries()).reduce(
        (prev, [k, v]) => ({
          ...prev,
          [k]: v,
        }),
        {}
      );
      updateFilters(query);
    }, 200);

    return () => {
      clearTimeout(t);
    };
  }, [queryString, updateFilters]);

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
                const id = ids[ids.length - 1];
                if (!id) return;
                readEvent(id);
              }}
            />
          ),
        })),
    [dateFormat, events, generateSectionContent, readEvent]
  );

  let content;
  if (events === 'loading') {
    content = <Loading />;
  } else if (feedSections.length === 0) {
    if (Object.keys(filters).length === 0) {
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
        <div className="border-b  -mt-[1px]">
          <PageHeader
            className="h-[4rem] flex items-center pr-page-header-full-left !border-0"
            title={
              <HorizontalSeparatedNav className="flex-1">
                <HorizontalSeparatedNav.Separator>
                  <span className="text-base font-bold">
                    {t('events.title')}
                  </span>
                </HorizontalSeparatedNav.Separator>
                <HorizontalSeparatedNav.Separator className="flex-1">
                  <input
                    className="flex-1 focus:outline-none text-base"
                    placeholder={t('events.search.placeholder')}
                    value={queryString.get('text') || ''}
                    onChange={({ target: { value } }) => updateQuery(value)}
                  />
                </HorizontalSeparatedNav.Separator>
              </HorizontalSeparatedNav>
            }
            extra={[
              <Button
                key="filters"
                variant="grey"
                className={showFilters ? '' : '!bg-dark-accent !text-white'}
                onClick={() => setShowFilters(!showFilters)}
              >
                {filtersCount > 0 && (
                  <Badge count={filtersCount} status="warning" />
                )}
                {t('events.filters.title')}
                {filtersCount > 0 && (
                  <span className="ml-1 text-xs">({filtersCount})</span>
                )}
              </Button>,
            ]}
          ></PageHeader>
          <StretchContent visible={showFilters}>
            <Filters />
          </StretchContent>
        </div>
      }
      className="h-full"
    >
      <div className="flex h-full overflow-auto flex-col" ref={ref}>
        {content}
        {feedSections.length > 0 && (
          <Button onClick={nextEvents}>{t('events.more')}</Button>
        )}
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
    updateFilters,
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
    updateFilters,
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
        updateFilters,
        workspaceName,
      });
    }, 10);
    return () => {
      clearTimeout(t);
    };
  }, [
    events,
    nextEvents,
    readEvents,
    readEvent,
    filters,
    workspaceName,
    updateFilters,
  ]);

  return <EventsViewerRenderer {...props} />;
};
export default EventsViewer;
