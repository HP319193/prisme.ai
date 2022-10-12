import { Loading } from '@prisme.ai/design-system';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from './WorkspaceProvider';
import getConfig from 'next/config';

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

  useEffect(() => {
    if (!ref.current || !ref.current.contentWindow) return;
    if (pageId.current !== page.id) {
      pageId.current = page.id;
      setLoading(true);
      return;
    }
    try {
      ref.current.contentWindow.postMessage(
        { type: 'updatePagePreview', page: JSON.parse(JSON.stringify(page)) },
        '*'
      );
      setLoading(false);
    } catch {}
  }, [page]);

  const initialPage = useRef(page);
  const url = useMemo(
    () =>
      `${window.location.protocol}//${slug}${PAGES_HOST}/${
        initialPage.current.slug === 'index'
          ? ''
          : initialPage.current.slug || initialPage.current.id
      }`,
    [slug]
  );

  return (
    <div className="flex flex-1 relative">
      <iframe
        ref={ref}
        src={url}
        className="flex flex-1"
        onLoad={() => setLoading(false)}
      />
      {loading && (
        <div className="flex absolute top-0 left-0 bottom-0 right-0 items-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default PagePreview;
