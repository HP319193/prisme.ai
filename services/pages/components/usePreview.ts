import { useEffect } from 'react';

export const usePreview = (onPreview: (page: Prismeai.Page) => void) => {
  useEffect(() => {
    // For preview in console
    const listener = (e: MessageEvent) => {
      const { type, page } = e.data || {};
      if (type === 'updatePagePreview') {
        onPreview(page);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [onPreview]);
};
