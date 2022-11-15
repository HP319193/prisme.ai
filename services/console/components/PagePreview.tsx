import { Loading } from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from './WorkspaceProvider';
import getConfig from 'next/config';
import { generatePageUrl } from '../utils/urls';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

interface PagePreviewProps {
  page: Prismeai.Page;
}

export const PagePreview = ({ page }: PagePreviewProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const pageId = useRef(page.id);
  const [loading, setLoading] = useState(true);
  const {
    workspace: { id, slug = id },
  } = useWorkspace();

  const updatePage = useCallback(() => {
    if (!ref.current || !ref.current.contentWindow) return;
    try {
      ref.current.contentWindow.postMessage(
        { type: 'updatePagePreview', page: JSON.parse(JSON.stringify(page)) },
        '*'
      );
      setLoading(false);
    } catch {}
  }, [page]);

  useEffect(() => {
    if (pageId.current !== page.id) {
      pageId.current = page.id;
      setLoading(true);
      return;
    }
    updatePage();
  }, [page, updatePage]);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const [initialSlug, setInitialSlug] = useState(page.slug);

  useEffect(() => {
    setInitialSlug((slug) => {
      if (slug || !page.slug) return slug;
      return page.slug;
    });
  }, [page]);

  const url = useMemo(() => generatePageUrl(slug, initialSlug || ''), [
    slug,
    initialSlug,
  ]);

  return (
    <div className="flex flex-1 relative">
      <iframe ref={ref} src={url} className="flex flex-1" onLoad={onLoad} />
      {loading && (
        <div className="flex absolute top-0 left-0 bottom-0 right-0 items-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default PagePreview;
