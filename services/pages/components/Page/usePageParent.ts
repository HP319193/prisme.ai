import { useEffect } from 'react';
import { Events } from '@prisme.ai/sdk/lib/events';

export const usePageParent = (events: Events | undefined) => {
  // Listen to update page events

  useEffect(() => {
    if (!window || !events || !window.addEventListener) return;
    const listener = (e: MessageEvent) => {
      const { type, event, payload } = e.data || {};
      if (type === 'emit') {
        events.emit(event, payload);
      }
    };
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [events]);
};

export default usePageParent;
