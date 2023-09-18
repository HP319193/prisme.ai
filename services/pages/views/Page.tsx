import DefaultErrorPage from 'next/error';
import React, { useEffect, useState } from 'react';
import { Loading } from '@prisme.ai/design-system';
import api from '../../console/utils/api';
import PageRenderer, {
  PageProps as PageRendererProps,
} from '../components/Page/Page';
import { usePage } from '../components/Page/PageProvider';
import { useWorkspace } from '../components/Workspace';
import FourHundredOne from './401';
import FourHundredFour from './404';

export interface PageProps extends Omit<PageRendererProps, 'page'> {
  page: PageRendererProps['page'] | null;
}

export const Page = () => {
  const { page, error, loading } = usePage();
  const { setId } = useWorkspace();
  const [displayError, setDisplayError] = useState(false);
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    setId(page.workspaceId);
  }, [page, setId]);

  useEffect(() => {
    window.parent.postMessage('page-ready', '*');
    if (!loading && error && error && ![401, 403].includes(error)) {
      setTimeout(() => setDisplayError(true), 10);
    }
  }, [error, loading]);

  if (!page && loading) return <Loading />;

  if (page) {
    if (page.apiKey) {
      api.apiKey = page.apiKey;
    }
    return <PageRenderer page={page} error={error} />;
  }

  if (error && ![401, 403].includes(error)) {
    if (displayError) {
      return <FourHundredFour />;
    }
    return <Loading />;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return <FourHundredOne />;
};

export default Page;
