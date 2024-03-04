import Head from 'next/head';
import { useEffect, useMemo, useRef } from 'react';
import useLocalizedText from '../../../console/utils/useLocalizedText';
import api from '../../../console/utils/api';
import BlockLoader from './BlockLoader';
import { usePage } from './PageProvider';
import PoweredBy from '../../../console/components/PoweredBy';
import dynamic from 'next/dynamic';
import { useUser } from '../../../console/components/UserProvider';
import { defaultStyles } from '@prisme.ai/console/views/Page/defaultStyles';

const Debug = dynamic(() => import('../Debug'), { ssr: false });

export interface PageProps {
  page: Prismeai.DetailedPage;
  error?: number | null;
}

export const Page = ({ page }: PageProps) => {
  const { localize } = useLocalizedText();
  const { events } = usePage();
  const containerEl = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const isSignedIn = user?.authData && !user?.authData?.anonymous;

  useEffect(() => {
    window.Prisme = window.Prisme || {};
    window.Prisme.ai = window.Prisme.ai || {};
    window.Prisme.ai.api = api;
    window.Prisme.ai.events = events;
  }, [events]);

  const blocksListConfig = useMemo(() => {
    const blocks = (page.blocks || []).map(
      ({ config: oldSchoolConfig, ...config }) => {
        const { className = '', ...consolidatedConfig } = {
          ...oldSchoolConfig,
          ...config,
        };
        consolidatedConfig.className = `${className} block-${consolidatedConfig.slug}`;
        return consolidatedConfig;
      }
    );
    const {
      appInstances,
      id,
      labels,
      name,
      public: _public,
      slug,
      styles = defaultStyles,
      workspaceId,
      workspaceSlug,
      ...pageConfig
    } = page;

    return {
      ...pageConfig,
      blocks,
      SYSTEM: {
        userIsSignedIn: isSignedIn,
      },
    };
  }, [isSignedIn, page]);

  const { styles = defaultStyles } = page;

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] min-h-full">
      <Head>
        <title>{localize(page.name)}</title>
        <meta name="description" content={localize(page.description)} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        {page.favicon && (
          <link rel="icon" href={page.favicon || '/favicon.png'} />
        )}
      </Head>
      {console.log('s4', styles)}
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}

      <div
        className="flex flex-1 flex-col page-blocks w-full"
        ref={containerEl}
      >
        <BlockLoader
          key={page.id}
          name="BlocksList"
          config={blocksListConfig}
        />
      </div>
      <PoweredBy />
      <Debug />
    </div>
  );
};

export default Page;
