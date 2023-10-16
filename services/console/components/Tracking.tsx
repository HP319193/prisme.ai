import { createContext, ReactNode, useCallback, useEffect } from 'react';
import { useContext } from '../utils/useContext';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const { TRACKING: { url = '', siteId = '' } = {}, TRACKING_WEBHOOK } =
  publicRuntimeConfig;

declare global {
  interface Window {
    _paq: any;
  }
}

function trackPageView() {
  if (!window._paq) return;
  window._paq.push([
    'setCustomUrl',
    `/${window.location.pathname}${
      window.location.hash ? `/${window.location.hash.substring(1)}` : ''
    }`.replace(/\/\//g, '/'),
  ]);
  window._paq.push(['setDocumentTitle', document.title]);
  window._paq.push(['trackPageView']);
  window._paq.push(['MediaAnalytics::scanForMedia']);
  window._paq.push(['enableLinkTracking']);
}
function trackEvent({
  category,
  action,
  name,
  value,
  dimensions,
}: {
  category: string;
  action: string;
  name: string;
  value?: string | object;
  dimensions?: Record<string, string>;
}) {
  if (TRACKING_WEBHOOK) {
    fetch(TRACKING_WEBHOOK, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        event: {
          category,
          action,
          name,
          value,
          dimensions,
        },
      }),
    });
  }
  const push = window._paq
    ? (...args: any) => window._paq.push(...args)
    : console.log;
  push([
    'trackEvent',
    category,
    action,
    name,
    typeof value === 'object' ? null : value,
    dimensions,
  ]);
}

interface TrackingContext {
  trackPageView: typeof trackPageView;
  trackEvent: (p: Partial<Parameters<typeof trackEvent>[0]>) => void;
}
const context = createContext<TrackingContext | undefined>({
  trackPageView,
  trackEvent: () => {},
});
export const useTracking = () => useContext<TrackingContext>(context);

interface TrackingCategoryProps {
  category: string;
  children: ReactNode;
}

export const TrackingCategory = ({
  category = '',
  children,
}: TrackingCategoryProps) => {
  const trackEventHandler = useCallback(
    ({ name, action, category: c = category }) => {
      trackEvent({ category, name, action });
    },
    [category]
  );
  return (
    <context.Provider value={{ trackPageView, trackEvent: trackEventHandler }}>
      {children}
    </context.Provider>
  );
};

export const Tracking = ({ children }: { children: ReactNode }) => {
  const { asPath } = useRouter();
  useEffect(() => {
    if (!url || window._paq) return;
    const paq = (window._paq = window._paq || []);
    paq.push(['trackPageView']);
    paq.push(['enableLinkTracking']);
    const u = url;
    paq.push(['setTrackerUrl', u + 'matomo.php']);
    paq.push(['setSiteId', siteId]);
    const s = document.createElement('script');
    s.async = true;
    s.src = '//cdn.matomo.cloud/prismeai.matomo.cloud/matomo.js';
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    trackPageView();
  }, [asPath]);

  const trackEventHandler = useCallback((p) => {
    trackEvent(p);
  }, []);

  return (
    <context.Provider value={{ trackPageView, trackEvent: trackEventHandler }}>
      {children}
    </context.Provider>
  );
};

export default Tracking;
