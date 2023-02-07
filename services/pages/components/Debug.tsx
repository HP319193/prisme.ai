import { useCallback, useEffect, useState } from 'react';
import Storage from '../../console/utils/Storage';
import { usePage } from './Page/PageProvider';

declare global {
  interface Window {
    toggleDebug: () => void;
  }
}

export const Debug = () => {
  const [display, setDisplay] = useState(!!Storage.get('__debug'));
  const { events } = usePage();

  window.toggleDebug = useCallback(() => {
    if (display) {
      Storage.remove('__debug');
    } else {
      Storage.set('__debug', '1');
    }
    setDisplay(!display);
  }, [display]);

  useEffect(() => {
    if (!events || !display) return;
    const off = events.all((type, payload) => {
      console.groupCollapsed(type);
      console.log(payload);
      console.groupEnd();
    });

    return () => {
      off();
    };
  }, [events, display]);

  return null;
};

export default Debug;
