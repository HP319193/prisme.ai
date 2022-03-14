import { useWorkspace, WorkspaceContext } from '../../layouts/WorkspaceLayout';
import { useDateFormat } from '../../utils/dates';
import EventDetails from './EventDetails';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useScrollListener } from '../useScrollListener';
import { Collapse, Feed, Layout, Loading } from '@prisme.ai/design-system';
import { Section } from '@prisme.ai/design-system/lib/Components/Feed';
import { CollapseItem } from '@prisme.ai/design-system/lib/Components/Collapse';
import { Event } from '@prisme.ai/sdk';
import Empty from './Empty';

export const EventsViewerRenderer = memo(function EventsViewserRendere({
  events,
  nextEvents,
  readEvents,
  readEvent,
}: Pick<
  WorkspaceContext,
  'events' | 'nextEvents' | 'readEvent' | 'readEvents'
>) {
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
        label: (
          <div className="flex flex-col">
            <div
              className={`flex flex-row ${
                readEvents.has(event.id) ? 'opacity-50' : ''
              }`}
            >
              <div className="font-bold">
                {event.source?.appSlug || event.source?.host?.service}
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
    [dateFormat, readEvent, readEvents]
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
    [dateFormat, events, generateSectionContent]
  );

  let content;
  if (events === 'loading') {
    content = <Loading />;
  } else if (feedSections.length === 0) {
    content = <Empty />;
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
});

export const EventsViewer = () => {
  const { events, nextEvents, readEvents, readEvent } = useWorkspace();

  return (
    <EventsViewerRenderer
      events={events}
      nextEvents={nextEvents}
      readEvents={readEvents}
      readEvent={readEvent}
    />
  );
};
export default EventsViewer;
