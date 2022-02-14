import { useTranslation } from 'next-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { useDateFormat } from '../../utils/dates';
import EventDetails from './EventDetails';
import Loading from '../Loading';
import { useCallback, useEffect, useMemo } from 'react';
import { useScrollListener } from '../useScrollListener';
import { Collapse, Feed, Layout } from '@prisme.ai/design-system';
import { Section } from '@prisme.ai/design-system/lib/Components/Feed';
import { CollapseItem } from '@prisme.ai/design-system/lib/Components/Collapse';
import { Event } from '../../api/types';

export const EventsViewer = () => {
  const { t } = useTranslation('workspaces');
  const { events, nextEvents, readEvents } = useWorkspace();
  const dateFormat = useDateFormat();
  const { ref, bottom } = useScrollListener<HTMLDivElement>();

  useEffect(() => {
    if (bottom) {
      nextEvents();
    }
  }, [bottom, nextEvents]);

  const generateSectionContent = useCallback(
    (events: Set<Event<Date>>): CollapseItem[] =>
      Array.from(events).map((event) => ({
        label: `${dateFormat(event.createdAt, {
          relative: true,
        })} ${event.source?.app || event.source?.host?.service}`,
        content: <EventDetails {...event} />,
        className: readEvents.has(event.id) ? 'opacity-50' : '',
      })),
    [dateFormat]
  );

  // readEvents.has(event.id) ? 'opacity-50' : '' à appliquer sur les collapse

  const feedSections: Section[] = useMemo(
    () =>
      Array.from(events === 'loading' ? [] : events)
        .sort(([date1], [date2]) => date2 - date1)
        .map(([date, events]) => ({
          title: dateFormat(new Date(date), {
            relative: true,
            withoutHour: true,
          }),
          content: <Collapse items={generateSectionContent(events)} />,
        })),
    [dateFormat, events]
  );

  let content;
  if (events === 'loading') {
    content = <Loading />;
  } else if (feedSections.length === 0) {
    content = <div className="p-2">{t('events.empty')}</div>;
  } else {
    content = (
      <div className="w-full overflow-auto" ref={ref}>
        <Feed sections={feedSections} />
      </div>
    );
  }

  return (
    <Layout Header={<div className="h-8" />} className="h-full">
      <div className="p-2 flex h-full">{content}</div>
    </Layout>
  );
};

export default EventsViewer;
