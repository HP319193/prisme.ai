import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import api from '../../../console/utils/api';
import { usePreview } from '../usePreview';

export const usePageFetcher = () => {
  const [page, setPage] = useState<Prismeai.DetailedPage | null>(null);
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

  const setPageFromChildren = useCallback(
    (page: Prismeai.DetailedPage | null, error?: number | null) => {
      if (page || (error && ![401, 403].includes(error))) {
        setPage(page);
        return;
      }

      fetchPage();
    },
    [fetchPage]
  );

  usePreview(setPage);

  return { page, setPage: setPageFromChildren, loading, fetchPage };
};

export default usePageFetcher;