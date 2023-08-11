import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import api from '../../../console/utils/api';
import { getSubmodain } from '../../../console/utils/urls';

export const usePageFetcher = (pageFromServer?: Prismeai.DetailedPage) => {
  const [page, setPage] = useState<Prismeai.DetailedPage | null>(
    pageFromServer || null
  );
  const [loading, setLoading] = useState(false);
  const {
    query: { pageSlug: path = '' },
  } = useRouter();
  const slug = Array.isArray(path) ? path.join('/') : path;

  const fetchPage = useCallback(async () => {
    try {
      const workspaceSlug = getSubmodain(window.location.host);

      const page = await api.getPageBySlug(
        workspaceSlug,
        slug === '' ? 'index' : slug
      );
      api.token = api.token || page.headers?.apiToken;
      setPage(page);
    } catch (e) {}
    setLoading(false);
  }, [slug]);

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
    if (pageFromServer) return;
    setLoading(true);
    fetchPage();
  }, [fetchPage, pageFromServer]);

  return { page, setPage: setPageFromChildren, loading, fetchPage };
};

export default usePageFetcher;
