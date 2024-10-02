import { useEffect, useMemo } from 'react';

import api from '../../../console/utils/api';
import BlockLoader from './BlockLoader';
import { usePage } from './PageProvider';

import { useUser } from '../../../console/components/UserProvider';
import BlockPage from './BlockPage';
import { BlockProvider } from '@prisme.ai/blocks';

export interface PageProps {
  page: Prismeai.DetailedPage;
  error?: number | null;
}

export const Page = ({ page }: PageProps) => {
  const { events } = usePage();

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
      public: _public,
      slug,
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

  return (
    <BlockProvider config={blocksListConfig}>
      <BlockLoader
        key={page.id}
        name="BlockPage"
        component={BlockPage}
        config={blocksListConfig}
      />
    </BlockProvider>
  );
};

export default Page;
