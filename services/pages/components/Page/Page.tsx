import Head from 'next/head';
import { useEffect, useMemo, useRef } from 'react';
import useLocalizedText from '../../../console/utils/useLocalizedText';
import api, { Events } from '../../../console/utils/api';
import { BlockLoader } from './BlockLoader';
import { usePage } from './PageProvider';
import PoweredBy from '../../../console/components/PoweredBy';
import dynamic from 'next/dynamic';

const Debug = dynamic(() => import('../Debug'), { ssr: false });

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
  const { localize } = useLocalizedText();
  const { blocksConfigs, events } = usePage();
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
        ? (page.blocks || []).map(({ slug = '', config, appInstance }) => {
            return {
              slug,
              appInstance,
              config,
              key: `block-${parseInt(`${Math.random() * 10000}`)}`,
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

      <div
        className="flex flex-1 flex-col page-blocks w-full"
        ref={containerEl}
      >
        {blocks.map(({ slug = '', appInstance = '', key }, index) => (
          <div
            key={key}
            className={`page-block block-${appInstance.replace(
              /\s/g,
              '-'
            )} block-${slug.replace(/\s/g, '-')} snap-start z-10`}
            id={(blocksConfigs[index] || {}).sectionId}
          >
            <BlockLoader name={slug} config={blocksConfigs[index]} />
          </div>
        ))}
      </div>
      <PoweredBy />
      <Debug />
    </div>
  );
};

export default Page;
