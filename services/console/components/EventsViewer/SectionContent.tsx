import useLocalizedText from '@prisme.ai/blocks/lib/useLocalizedText';
import { Tooltip } from '@prisme.ai/design-system';
import { Trans, useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Event } from '../../utils/api';
import { useApps } from '../AppsProvider';
import { useSourceDetails } from '../SourceDetails';
import { AutomationLabel, ErrorLabel, EventLabel, PageLabel } from './Labels';

interface SectionContentProps {
  title: string;
  date: string;
  type: string;
  read: boolean;
  event: Event<Date>;
}

export const SectionContent = ({
  title,
  date,
  type,
  read,
  event,
}: SectionContentProps) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { photo, name, description } = useSourceDetails();
  const { appInstances } = useApps();

  const labelValues = useMemo(() => {
    let automationSlug =
      event.payload?.automation?.slug ||
      event.payload?.automationSlug ||
      event.source?.automationSlug ||
      '';

    if (event.source.appSlug) {
      const apps = appInstances.get(event.source.workspaceId || '') || [];
      const app = apps.find(({ appSlug }) => appSlug === event.source.appSlug);
      const automation = app?.automations.find(
        ({ slug }) => slug === automationSlug
      );

      automationSlug = automation?.slug || automationSlug;
    }

    const automationName = event?.payload?.automation?.name || '';

    function getWaits() {
      if (!event?.payload?.wait) return '';
      if (event?.payload?.wait.oneOf && event?.payload?.wait.oneOf.length > 0) {
        const events = event?.payload?.wait?.oneOf?.map(
          ({ event }: any) => event
        );

        return t('feed.type_runtime.waits.pending_oneOf', {
          count: events.length,
          events: events.join(', '),
        });
      }
      return t('feed.type_runtime.waits.pending_timeout', {
        timeout: event?.payload?.wait?.timeout || 0,
      });
    }

    return {
      automation: localize(automationName ? automationName : automationSlug),
      page: event?.payload?.page?.name && localize(event.payload.page.name),
      event: event?.payload?.event?.type,
      waits: getWaits(),
    };
  }, [appInstances, event, localize, t]);

  const cleanedType = `${type}`.match(/^runtime\.waits\.fulfilled/)
    ? 'runtime.waits.fulfilled'
    : type;

  return (
    <Tooltip title={localize(description)}>
      <div className="flex flex-col">
        <div className={`flex flex-row ${read ? 'opacity-50' : ''}`}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              height={25}
              width={25}
              className="mr-2 rounded-[0.3rem] object-cover"
              alt={name}
            />
          )}
          <div className="font-bold text-[1rem]">{title}</div>
          <div className="text-gray font-thin ml-4 text-[0.875rem]">{date}</div>
        </div>
        <div
          className={`font-light text-[1rem] mt-[0.625rem] ${
            photo ? 'ml-[2rem]' : ''
          }`}
        >
          <Trans
            t={t}
            i18nKey="feed.type"
            context={type}
            values={{ ...labelValues, context: cleanedType }}
            components={{
              automation: <AutomationLabel {...event} />,
              page: <PageLabel {...event} />,
              event: <EventLabel {...event} />,
              error: <ErrorLabel {...event} />,
            }}
          />
        </div>
      </div>
    </Tooltip>
  );
};

export default SectionContent;
