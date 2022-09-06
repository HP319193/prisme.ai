import { Loading } from '@prisme.ai/design-system';
import { useEffect, useRef, useState } from 'react';

interface PagePreviewProps {
  page: Prismeai.Page;
}

export const PagePreview = ({ page }: PagePreviewProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const pageId = useRef(page.id);
  const [loading, setLoading] = useState(true);

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
    } catch {}
  }, [page]);

  return (
    <div className="flex flex-1 relative">
      <iframe
        ref={ref}
        src={`/pages/${page.id}`}
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
