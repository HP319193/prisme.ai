import { useEffect, useState } from 'react';
import Storage from '../../../console/utils/Storage';

const DEBUG_KEY = '__blocksDebug';

function getInitialDebug(): Map<string, string> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Server side does not have Storage');
    }
    return new Map(JSON.parse(Storage.get(DEBUG_KEY)));
  } catch {
    return new Map();
  }
}

export function useDebug() {
  const [debug, setDebug] = useState(getInitialDebug());

  useEffect(() => {
    window.Prisme.ai.debug.blocks = window.Prisme.ai.debug.blocks || {};
    window.Prisme.ai.debug.blocks.setBlockUrl = (name, url) => {
      setDebug((prev) => {
        const newDebug = new Map(prev);
        newDebug.set(name, url);
        window.Prisme.ai.debug.blocks.state = newDebug.size > 0;
        Storage.set(
          DEBUG_KEY,
          JSON.stringify(JSON.stringify(Array.from(newDebug)))
        );
        return newDebug;
      });
      return window.Prisme.ai.debug.blocks.state;
    };
    window.Prisme.ai.debug.blocks.reset = () => {
      Storage.remove(DEBUG_KEY);
      setDebug(new Map());
      window.Prisme.ai.debug.blocks.state = false;
      return false;
    };
  }, []);

  return debug;
}
