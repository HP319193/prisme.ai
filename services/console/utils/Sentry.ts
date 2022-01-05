import getConfig from "next/config";
import { useCallback, useEffect } from "react";

const { publicRuntimeConfig } = getConfig();

export const Sentry = () => {
  const init = useCallback(async () => {
    if (!publicRuntimeConfig.SENTRY_DSN) return;
    const [Sentry, Tracing] = await Promise.all([
      import("@sentry/browser"),
      import("@sentry/tracing"),
    ]);

    Sentry.init({
      dsn: publicRuntimeConfig.SENTRY_DSN,
      integrations: [new Tracing.Integrations.BrowserTracing()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  }, []);
  useEffect(() => {
    init();
  }, [init]);
  return null;
};

export default Sentry;
