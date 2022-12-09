import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { useScrollListener } from '../useScrollListener';
import useLocalizedText from '../../utils/useLocalizedText';
import { Button, Layout, StretchContent } from '@prisme.ai/design-system';
import { Badge, PageHeader } from 'antd';
import HorizontalSeparatedNav from '../HorizontalSeparatedNav';
import Filters from './Filters';
import { useQueryString } from '../../providers/QueryStringProvider';
import { useWorkspace } from '../../providers/Workspace';
import { useEvents } from '../../providers/Events';
import EventsList from './EventsList';
import EmptyActivities from './EmptyActivities';
import { ExceptionOutlined } from '@ant-design/icons';

export const Activities = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const {
    workspace: { name: workspaceName },
  } = useWorkspace();
  const {
    events,
    loading,
    setFilters,
    fetchEvents,
    fetchNextEvents,
    hasMore,
    read,
    isRead,
    isVirgin,
  } = useEvents();
  const { queryString, setQueryString } = useQueryString();
  const { ref, bottom } = useScrollListener<HTMLDivElement>({ margin: -1 });

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
    const t = setTimeout(() => {
      const query = Array.from(queryString.entries()).reduce(
        (prev, [k, v]) => ({
          ...prev,
          [k]: v,
        }),
        {}
      );
      setFilters(query);
    }, 200);

    return () => {
      clearTimeout(t);
    };
  }, [fetchEvents, queryString, setFilters]);

  useEffect(() => {
    if (bottom) {
      fetchNextEvents();
    }
  }, [bottom, fetchNextEvents]);

  const noResult = events.size === 0;

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
        {!loading && isVirgin && <EmptyActivities />}
        {!loading && noResult && (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-1 justify-center items-center flex-col">
              <ExceptionOutlined className="text-[50px] !text-gray mb-5" />
              {t('events.filters.empty')}
            </div>
          </div>
        )}
        {!noResult && !isVirgin && (
          <>
            <EventsList
              events={events}
              workspaceName={localize(workspaceName)}
              read={read}
              isRead={isRead}
            />
            {hasMore && (
              <Button onClick={fetchNextEvents}>{t('events.more')}</Button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
export default Activities;
