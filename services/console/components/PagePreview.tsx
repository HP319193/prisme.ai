import { Loading } from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generatePageUrl } from '../utils/urls';
import { useWorkspace } from '../providers/Workspace';
import { usePage } from '../providers/Page';

interface PagePreviewProps {
  page: Prismeai.Page;
}

export const PagePreview = ({ page }: PagePreviewProps) => {
  const {
    workspace: { id, slug = id },
  } = useWorkspace();
  const { appInstances } = usePage();

  const ref = useRef<HTMLIFrameElement>(null);
  const pageId = useRef(page.id);
  const [loading, setLoading] = useState(true);

  const updatePage = useCallback(() => {
    if (!ref.current || !ref.current.contentWindow) return;
    try {
      ref.current.contentWindow.postMessage(
        {
          type: 'updatePagePreview',
          page: JSON.parse(
            JSON.stringify({
              ...page,
              appInstances,
            })
          ),
        },
        '*'
      );
      setLoading(false);
    } catch {}
  }, [page, appInstances]);

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
