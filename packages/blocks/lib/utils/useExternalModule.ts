import { useCallback, useEffect, useState } from 'react';

interface UseExternalModule {
  url: string;
  externals?: Record<string, any>;
}

type ExternalModule = Function;

const Cache = new Map();

export async function loadModule<T = {}>(url: string) {
  const cache: Map<string, Promise<T>> = Cache;
  if (!cache.get(url)) {
    cache.set(
      url,
      new Promise((resolve, reject) => {
        const uniqMethod = `__load_${(Math.random() * 1000).toFixed()}`;
        // @ts-ignore
        window[uniqMethod] = (module) => {
          // @ts-ignore
          delete window[uniqMethod];
          document.body.removeChild(s);
          resolve(module.default);
        };
        // @ts-ignore
        window[`${uniqMethod}_error`] = (e) => {
          reject(e);
        };
        const s = document.createElement('script');

        s.innerHTML = `
    import * as module from '${url}';
    try {
      window['${uniqMethod}'](module);
    } catch (e) {
      window['${uniqMethod}_error'](e);
    }
    `;
        s.type = 'module';
        document.body.appendChild(s);
      })
    );
  }
  return cache.get(url);
}

export const useExternalModule = <T = ExternalModule>({
  url,
  externals = {},
}: UseExternalModule) => {
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>();

  const fetchModule = useCallback(async () => {
    try {
      const module = await loadModule<T>(url);
      setModule(module ? () => module : null);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e);
    }
  }, [url]);

  useEffect(() => {
    // @ts-ignore
    if (process.browser) {
      // @ts-ignore
      window.__external = {
        // @ts-ignore
        ...(window.__external || {}),
        ...externals,
      };
    }
    fetchModule();
  }, [url, externals, fetchModule]);

  return { module, loading, error };
};

export default useExternalModule;
