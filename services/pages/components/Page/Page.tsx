import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import useLocalizedText from '../../../console/utils/useLocalizedText';
import api from '../../../console/utils/api';
import BlockLoader, { callAutomation } from './BlockLoader';
import { usePage } from './PageProvider';
import PoweredBy from '../../../console/components/PoweredBy';
import dynamic from 'next/dynamic';
import { useUser } from '../../../console/components/UserProvider';
import { defaultStyles } from '../../../console/views/Page/defaultStyles';
import { interpolateValue } from './computeBlocks';

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
  const [computedConfig, setComputedConfig] = useState({});

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
      automation,
      ...pageConfig
    } = page;

    return {
      ...pageConfig,
      blocks,
      SYSTEM: {
        userIsSignedIn: isSignedIn,
      },
      ...computedConfig,
    };
  }, [computedConfig, isSignedIn, page]);

  useEffect(() => {
    const { workspaceId, automation } = page;

    async function fetch() {
      if (!workspaceId || !automation) return;
      const urlSearchParams = new URLSearchParams(window.location.search);
      const query = {
        pageSlug: page.slug,
        ...Object.fromEntries(urlSearchParams.entries()),
      };

      setComputedConfig(await callAutomation(workspaceId, automation, query));
    }
    fetch();
  }, [page]);

  const { styles = defaultStyles } = page;

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] min-h-full">
      <Head>
        <title>{localize(interpolateValue(page.name, blocksListConfig))}</title>
        <meta name="description" content={localize(page.description)} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        {page.favicon && (
          <link rel="icon" href={page.favicon || '/favicon.png'} />
        )}
      </Head>
      {styles && (
        <style
          dangerouslySetInnerHTML={{
            __html: interpolateValue(styles, blocksListConfig),
          }}
        />
      )}

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
