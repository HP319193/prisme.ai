import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import React, { useCallback, useEffect, useState } from 'react';
import { Loading } from '@prisme.ai/design-system';
import SigninForm from '../../console/components/SigninForm';
import api from '../../console/utils/api';
import PageRenderer, {
  PageProps as PageRendererProps,
} from '../components/Page/Page';
import { usePreview } from '../components/usePreview';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export interface PageProps extends Omit<PageRendererProps, 'page'> {
  page: PageRendererProps['page'] | null;
}

export const Page = ({ page: pageFromServer, error }: PageProps) => {
  const [page, setPage] = useState(pageFromServer);
  const [loading, setLoading] = useState(true);
  const {
    query: { slug = 'index' },
  } = useRouter();

  const fetchPage = useCallback(async () => {
    try {
      const [, workspaceSlug] =
        window.location.hostname.match(/^([^\.]+)\./) || [];

      const page = await api.getPageBySlug(workspaceSlug, `${slug}`);
      setPage(page);
    } catch (e) {}
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (pageFromServer || (error && ![401, 403].includes(error))) {
      setPage(pageFromServer);
      return;
    }
    // Server didn't fetch page because it needs permissions
    // User should have them
    const listener = (e: MessageEvent) => {
      const { type, token } = e.data;
      if (type === 'api.token') {
        api.token = token;
      }
    };
    window.addEventListener('message', listener);
    window.parent.postMessage(
      { type: 'pageError', code: error },
      publicRuntimeConfig.CONSOLE_HOST
    );

    fetchPage();

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [slug, error, pageFromServer, fetchPage]);

  usePreview(setPage);

  if (!page && loading) return <Loading />;

  if (error && ![401, 403].includes(error)) {
    return <DefaultErrorPage statusCode={error} />;
  }

  if (page) {
    if (page.apiKey) {
      api.apiKey = page.apiKey;
    }
    return <PageRenderer page={page} />;
  }

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={fetchPage} />
    </div>
  );
};

export default Page;
