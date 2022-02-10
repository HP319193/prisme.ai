import { Accordion, AccordionTab } from 'primereact/accordion';
import { useTranslation } from 'next-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { useDateFormat } from '../../utils/dates';
import EventDetails from './EventDetails';
import Loading from '../Loading';
import { useEffect } from 'react';
import { useScrollListener } from '../useScrollListener';

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

  if (events === 'loading') {
    return <Loading />;
  }

  const dates = Array.from(events.keys());

  if (dates.length === 0) return <div className="p-2">{t('events.empty')}</div>;

  dates.sort((a, b) => a - b).reverse();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={ref} className="overflow-auto">
        <Accordion multiple activeIndex={dates.map((v, k) => k)}>
          {dates.map((date) => (
            <AccordionTab
              key={date}
              header={dateFormat(new Date(date), {
                relative: true,
                withoutHour: true,
              })}
            >
              <Accordion multiple className="prisme-events-viewer__event">
                {Array.from((events.get(+date) || new Set()).values()).map(
                  (event) => (
                    <AccordionTab
                      key={event.id}
                      header={
                        <div
                          className={`
                          flex flex-1 flex-col
                          ${readEvents.has(event.id) ? 'opacity-50' : ''}
                        `}
                        >
                          <div className="flex flex-row">
                            <div className="flex font-bold mr-2">
                              {event.source?.app || event.source?.host?.service}
                            </div>
                            <div className="flex">
                              {dateFormat(event.createdAt, {
                                relative: true,
                              })}
                            </div>
                          </div>
                          <div className="flex">{event.type}</div>
                        </div>
                      }
                    >
                      <EventDetails {...event} />
                    </AccordionTab>
                  )
                )}
              </Accordion>
            </AccordionTab>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default EventsViewer;
