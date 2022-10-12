import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef } from 'react';
import useLocalizedText from '../../../console/utils/useLocalizedText';
import usePage from './usePage';
import api, { Events } from '../../../console/utils/api';
import PageBlock from './PageBlock';

declare global {
  interface Window {
    Prisme: {
      ai: {
        api: typeof api;
        events?: Events;
      };
    };
  }
}

export interface PageProps {
  page: Prismeai.DetailedPage;
  error?: number | null;
}

export const Page = ({ page }: PageProps) => {
  const { t } = useTranslation('common');
  const { localize } = useLocalizedText();
  const { blocksConfigs, events } = usePage(page);
  const containerEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.Prisme = window.Prisme || {};
    window.Prisme.ai = window.Prisme.ai || {};
    window.Prisme.ai.api = api;
    window.Prisme.ai.events = events;
  }, [events]);

  const blocks = useMemo(
    () =>
      page && typeof page === 'object'
        ? (page.blocks || []).map(({ name = '', url, config, appInstance }) => {
            return {
              name,
              url,
              appInstance,
              config,
            };
          })
        : [],
    [page]
  );

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] overflow-auto min-h-full snap-mandatory">
      <Head>
        <title>{localize(page.name)}</title>
        <meta name="description" content={localize(page.description)} />
      </Head>
      {page.styles && (
        <style dangerouslySetInnerHTML={{ __html: page.styles }} />
      )}
      <div className="absolute left-2 bottom-2 text-[0.75rem] text-pr-grey z-0">
        {t('powered')}
      </div>
      <div
        className="flex flex-1 flex-col page-blocks w-full"
        ref={containerEl}
      >
        {blocks.map(
          ({ name = '', appInstance = '', url = '', config = {} }, index) => (
            <div
              key={index}
              className={`page-block block-${appInstance.replace(
                /\s/g,
                '-'
              )} block-${name.replace(/\s/g, '-')} snap-start z-10`}
              id={(blocksConfigs[index] || {}).sectionId}
            >
              <PageBlock
                url={url}
                name={name}
                workspaceId={`${page.workspaceId}`}
                appInstance={appInstance}
                page={page}
                events={events}
                config={blocksConfigs[index]}
                container={containerEl.current || undefined}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Page;
