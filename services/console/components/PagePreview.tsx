import { useEffect, useRef, useState } from 'react';

interface PagePreviewProps {
  page: Prismeai.Page;
  visible: boolean;
}

export const PagePreview = ({ page, visible }: PagePreviewProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [unmounted, setUnmounted] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setUnmounted(false);
  }, [visible]);

  useEffect(() => {
    if (!ref.current || !ref.current.contentWindow) return;
    try {
      ref.current.contentWindow.postMessage(
        { type: 'updatePagePreview', page: JSON.parse(JSON.stringify(page)) },
        '*'
      );
    } catch {}
  }, [page]);

  if (unmounted) return null;

  return (
    <iframe
      ref={ref}
      src={`/pages/${page.id}`}
      className="flex-1 border-2 border-neutral-200"
    />
  );
};

export default PagePreview;
