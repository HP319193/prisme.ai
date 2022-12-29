import { Collapse, Feed } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import { EventsContext } from '../../providers/Events';
import { Event } from '../../utils/api';
import { useDateFormat } from '../../utils/dates';
import useLocalizedText from '../../utils/useLocalizedText';
import SourceDetails from '../SourceDetails';
import EventDetails from './EventDetails';
import SectionContent from './SectionContent';

interface EventsListProps {
  events: Set<Event<Date>>;
  read: EventsContext['read'];
  isRead: EventsContext['isRead'];
  workspaceName: string;
}

export const EventLabel = ({
  read,
  workspaceName,
  ...event
}: Event<Date> & { read: boolean; workspaceName: string }) => {
  const { localize } = useLocalizedText();
  const dateFormat = useDateFormat();

  return (
    <SourceDetails
      workspaceId={event.source.workspaceId}
      appSlug={event.source.appSlug}
    >
      <SectionContent
        title={event.source.appSlug || localize(workspaceName)}
        date={dateFormat(event.createdAt, {
          relative: true,
        })}
        type={event.type}
        read={read}
        event={event}
      />
    </SourceDetails>
  );
};

export const EventsList = ({
  events,
  workspaceName,
  read,
  isRead,
}: EventsListProps) => {
  const dateFormat = useDateFormat();

  const sections = useMemo(() => {
    const byDate = Array.from(events).reduce<[string, Set<Event<Date>>][]>(
      (prev, event) => {
        const eventDay =
          dateFormat(new Date(event.createdAt), {
            relative: true,
            withoutHour: true,
          }) || '';
        let prevDate = prev.find(([date]) => date === eventDay);
        if (!prevDate) {
          prevDate = [eventDay, new Set()];
          prev.push(prevDate);
        }
        prevDate[1].add(event);
        return prev;
      },
      []
    );

    return byDate.map(([title, events]) => {
      return {
        key: title,
        title,
        content: (
          <Collapse
            items={Array.from(events).map((event) => ({
              key: event.id,
              label: (
                <EventLabel
                  {...event}
                  read={isRead(event.id)}
                  workspaceName={workspaceName}
                />
              ),
              content: <EventDetails {...event} />,
            }))}
            light
            onChange={(ids) => {
              const id = ids[ids.length - 1];
              if (!id) return;
              read(id);
            }}
          />
        ),
      };
    });
  }, [dateFormat, events, isRead, read, workspaceName]);

  return <Feed sections={sections} />;
};

export default EventsList;
