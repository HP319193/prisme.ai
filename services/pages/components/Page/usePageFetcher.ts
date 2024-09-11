import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import api, { HTTPError } from '../../../console/utils/api';
import { getSubmodain } from '../../../console/utils/urls';
import { useRedirect } from './useRedirect';
import Storage from '../../../console/utils/Storage';

export const usePageFetcher = (
  pageFromServer?: Prismeai.DetailedPage,
  errorFromServer?: number
) => {
  const [page, setPage] = useState<Prismeai.DetailedPage | null>(
    pageFromServer || null
  );
  const [error, setError] = useState<null | number>(null);
  const [loading, setLoading] = useState(!pageFromServer);
  const {
    query: { pageSlug: path = '' },
    asPath: fullPath,
  } = useRouter();
  const redirect = useRedirect();

  const slug = Array.isArray(path) ? path.join('/') : path;

  const fetchPage = useCallback(async () => {
    try {
      const workspaceSlug = getSubmodain(window.location.host);

      const page = await api.getPageBySlug(
        workspaceSlug,
        slug === '' ? 'index' : slug
      );
      setPage(page);
    } catch (e) {
      const statusCode = (e as HTTPError).code;
      setError(statusCode);
      if ([401, 403].includes(statusCode) && !pageFromServer) {
        // Only if there is no pageFromServer (ie SSR disabled)
        Storage.set(
          'redirect-once-authenticated',
          new URL(fullPath, window.location.href).toString()
        );
        if (!window.location.href.includes('signin')) {
          redirect({
            url: new URL('/signin', window.location.href).toString(),
          });
        }
      } else {
        setPage(pageFromServer || null);
      }
    }
    setLoading(false);
  }, [pageFromServer, slug, redirect, fullPath]);

  const setPageFromChildren = useCallback(
    (page: Prismeai.DetailedPage | null, error?: number | null) => {
      if (page || (error && ![401, 403].includes(error))) {
        setPage(page);
        setLoading(false);
        return;
      }
      fetchPage();
    },
    [fetchPage]
  );

  useEffect(() => {
    if (!pageFromServer) return;
    setPage(pageFromServer);
  }, [pageFromServer]);

  useEffect(() => {
    if (pageFromServer && !errorFromServer) return;
    setLoading(true);
    // Display a loading while page is fetched
    setPage({
      slug: 'Loading',
      appInstances: [],
      blocks: [
        {
          slug: 'RichText',
          content: `<div class="flex flex-1 align-center justify-center "><div class="ant-spin ant-spin-spinning !flex justify-center items-center " aria-live="polite" aria-busy="true"><span class="ant-spin-dot ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span></div></div>`,
        },
      ],
      styles: `.page-blocks {
  justify-content: center;
}`,
    });

    fetchPage();
  }, [errorFromServer, fetchPage, pageFromServer]);

  return { page, setPage: setPageFromChildren, loading, fetchPage, error };
};

export default usePageFetcher;
