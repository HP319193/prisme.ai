import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import api from '../../../console/utils/api';
import { getSubmodain } from '../../../console/utils/urls';
import { usePreview } from '../usePreview';

export const usePageFetcher = (pageFromServer?: Prismeai.DetailedPage) => {
  const [page, setPage] = useState<Prismeai.DetailedPage | null>(
    pageFromServer || null
  );
  const [loading, setLoading] = useState(false);
  const {
    query: { slug = 'index' },
  } = useRouter();

  const fetchPage = useCallback(async () => {
    try {
      const workspaceSlug = getSubmodain(window.location.host);

      const page = await api.getPageBySlug(workspaceSlug, `${slug}`);
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
    if (pageFromServer) return;
    setLoading(true);
    fetchPage();
  }, [fetchPage, pageFromServer]);

  usePreview(setPage);

  return { page, setPage: setPageFromChildren, loading, fetchPage };
};

export default usePageFetcher;
