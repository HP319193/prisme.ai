import { useEffect } from 'react';
import { Events } from '@prisme.ai/sdk/lib/events';

export const usePageParent = (
  events: Events | undefined,
  setPage: (
    page: Prismeai.DetailedPage | null,
    error?: number | null | undefined
  ) => void
) => {
  // Listen to update page events
  useEffect(() => {
    if (!window || !events || !window.addEventListener) return;
    const listener = (e: MessageEvent) => {
      const { type, event, payload, page } = e.data || {};
      if (type === 'emit') {
        events.emit(event, payload);
      }
      if (type === 'updatePagePreview' && page) {
        setPage(page);
      }
    };
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [events, setPage]);
};

export default usePageParent;
