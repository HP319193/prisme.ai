import { useEffect, useRef } from 'react';

interface PagePreviewProps {
  page: Prismeai.Page;
}

export const PagePreview = ({ page }: PagePreviewProps) => {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current || !ref.current.contentWindow) return;

    try {
      ref.current.contentWindow.postMessage(
        { type: 'updatePagePreview', page: JSON.parse(JSON.stringify(page)) },
        '*'
      );
    } catch {}
  }, [page]);

  return (
    <iframe
      ref={ref}
      src={`/pages/${page.id}`}
      className="flex-1 border-2 border-neutral-200"
    />
  );
};

export default PagePreview;
