import { Accordion, AccordionTab } from 'primereact/accordion';
import { useTranslation } from 'next-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { useDateFormat } from '../../utils/dates';
import EventDetails from './EventDetails';
import Loading from '../Loading';
import { useCallback, useEffect, useMemo } from 'react';
import { useScrollListener } from '../useScrollListener';
import { Collapse, Feed, Layout } from '@prisme.ai/design-system';
import { CollapseItem } from '@prisme.ai/design-system/lib/Components/Collapse';
import { Event } from '../../api/types';
import { Section } from '@prisme.ai/design-system/lib/Components/Feed';

export type FeedSection = {
  title: string;
  content: CollapseItem[];
};

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

  const dates = Array.from((events === 'loading' ? [] : events).keys());

  dates.sort((a, b) => a - b).reverse();

  const generateSectionContent = useCallback(
    (events: Set<Event<Date>>): CollapseItem[] =>
      Array.from(events).map((event) => ({
        label: `${dateFormat(event.createdAt, {
          relative: true,
        })} ${event.source?.app || event.source?.host?.service}`,
        content: <EventDetails {...event} />,
      })),
    [dateFormat]
  );

  const feedSections: Section[] = useMemo(
    () =>
      Array.from(events === 'loading' ? [] : events).map(([date, events]) => ({
        title: dateFormat(new Date(date), {
          relative: true,
          withoutHour: true,
        }),
        content: <Collapse items={generateSectionContent(events)} />,
      })),
    [dateFormat, events]
  );

  if (events === 'loading') {
    return <Loading />;
  }

  if (dates.length === 0) return <div className="p-2">{t('events.empty')}</div>;

  return (
    <Layout Header={<div className="h-8" />}>
      <div className="p-2 flex grow">
        <Feed sections={feedSections} />
      </div>
    </Layout>
  );

  // return (
  //   <div className="flex flex-1 flex-column overflow-hidden">
  //     <div ref={ref} className="overflow-auto">
  //       <Accordion multiple activeIndex={dates.map((v, k) => k)}>
  //         {dates.map((date) => (
  //           <AccordionTab
  //             key={date}
  //             header={dateFormat(new Date(date), {
  //               relative: true,
  //               withoutHour: true,
  //             })}
  //           >
  //             <Accordion multiple className="prisme-events-viewer__event">
  //               {Array.from((events.get(+date) || new Set()).values()).map(
  //                 (event) => (
  //                   <AccordionTab
  //                     key={event.id}
  //                     header={
  //                       <div
  //                         className={`
  //                         flex flex-1 flex-column
  //                         ${readEvents.has(event.id) ? 'opacity-50' : ''}
  //                       `}
  //                       >
  //                         <div className="flex flex-row">
  //                           <div className="flex font-bold mr-2">
  //                             {event.source?.app || event.source?.host?.service}
  //                           </div>
  //                           <div className="flex">
  //                             {dateFormat(event.createdAt, {
  //                               relative: true,
  //                             })}
  //                           </div>
  //                         </div>
  //                         <div className="flex">{event.type}</div>
  //                       </div>
  //                     }
  //                   >
  //                     <EventDetails {...event} />
  //                   </AccordionTab>
  //                 )
  //               )}
  //             </Accordion>
  //           </AccordionTab>
  //         ))}
  //       </Accordion>
  //     </div>
  //   </div>
  // );
};

export default EventsViewer;
