import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import { syscfg, oidcCfg, GatewayConfig } from './config';
import initRoutes from './routes';
import { initMetrics } from './metrics';
import { logger } from './logger';
import '@prisme.ai/types';
import { closeStorage } from './storage';
import { broker } from './eda';
import { initOidcProvider } from './services/oidc/provider';
import startWorkspacesClientSync from './services/oidc/client';
import { JWKStore } from './services/jwks/store';
import { publishJWKToRuntime } from './services/jwks/internal';
import { findConfigErrors } from './config/gatewayConfigValidator';
import { ConfigurationError } from './types/errors';
import { CustomDomains } from './utils/customDomains';

const { PAGES_HOST, STUDIO_URL } = oidcCfg;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src':
          helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
        'frame-ancestors': ['self', STUDIO_URL, `*${PAGES_HOST}`],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

(async function () {
  const CustomDomainsService = await new CustomDomains().init();
  app.use(
    cors({
      credentials: true,
      origin: (origin = '', callback) => {
        if (CustomDomainsService.isAllowed(origin)) {
          callback(null, origin);
        } else {
          callback(null, false);
        }
      },
      exposedHeaders: [
        'X-Correlation-Id',
        'X-Prismeai-Session-Id',
        syscfg.OIDC_CLIENT_ID_HEADER,
        syscfg.CSRF_TOKEN_HEADER,
      ],
    })
  );

  let gtwcfg: GatewayConfig, oidc;
  try {
    const configErrors = findConfigErrors(syscfg.GATEWAY_CONFIG);
    if (configErrors) {
      throw new ConfigurationError('Bad configuration', configErrors);
    }
    gtwcfg = new GatewayConfig(syscfg.GATEWAY_CONFIG);

    const jwks = new JWKStore(broker);
    await jwks.init();
    // Keep runtime in sync with our signing JWK
    await publishJWKToRuntime(gtwcfg, jwks);
    jwks.on('jwks.updated', ({ fromLocal }) => {
      if (fromLocal) {
        publishJWKToRuntime(gtwcfg, jwks);
      }
    });

    oidc = await initOidcProvider(broker, jwks);

    initMetrics(app);
    await initRoutes(app, gtwcfg, broker, oidc, jwks);

    app.listen(syscfg.PORT, () => {
      logger.info(`Running on port ${syscfg.PORT}`);
    });
  } catch (e) {
    console.error({ ...(<object>e) });
    process.exit(1);
  }

  // Wait a bit before starting OIDC clients sync as local /oidc route might not be available yet
  setTimeout(async () => {
    try {
      await startWorkspacesClientSync(broker);
    } catch (e) {
      console.error({ ...(<object>e) });
      process.exit(1);
    }
  }, parseInt(process.env.DELAY_OIDC_WELL_KNOWN_PULL || '2000'));

  async function gracefulShutdown() {
    await closeStorage();
    await broker.close();
    process.exit(0);
  }

  process.on('uncaughtException', (err: Error) => {
    logger.error({ msg: 'Uncaught exception', err });
  });
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
})();
