import { useCallback, useEffect, useState } from 'react';
import Storage from '../../../console/utils/Storage';

const DEBUG_KEY = '__blocksDebug';

let initialDebug: any[] = [];
try {
  initialDebug = JSON.parse(Storage.get(DEBUG_KEY));
} catch {}

export function useDebug() {
  const [debug, setDebug] = useState<Map<string, string>>(
    new Map(initialDebug)
  );

  const debugSetBlocks = useCallback((name, url) => {
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
  }, []);
  const debugReset = useCallback(() => {
    Storage.remove(DEBUG_KEY);
    setDebug(new Map());
    window.Prisme.ai.debug.blocks.state = false;
    return false;
  }, []);

  if (typeof window !== 'undefined') {
    window.Prisme.ai.debug.blocks = window.Prisme.ai.debug.blocks || {};
    window.Prisme.ai.debug.blocks.setBlockUrl = debugSetBlocks;
    window.Prisme.ai.debug.blocks.reset = debugReset;
  }

  return debug;
}
