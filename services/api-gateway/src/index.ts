import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import { syscfg, GatewayConfig } from './config';
import initRoutes from './routes';
import { initMetrics } from './metrics';
import { logger } from './logger';
import '@prisme.ai/types';
import { closeStorage } from './storage';
import { broker } from './eda';
import { initOidcProvider } from './services/oidc/provider';
import startWorkspacesClientSync from './services/oidc/client';
import { cleanIncomingRequest } from './middlewares';

const { CONSOLE_URL = '', PAGES_HOST = '' } = process.env;

const app = express();
app.set('trust proxy', true);
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src':
          helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
        'frame-ancestors': ['self', CONSOLE_URL, `*${PAGES_HOST}`],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    credentials: true,
    origin: true,
    exposedHeaders: [
      'X-Correlation-Id',
      'X-Prismeai-Session-Id',
      syscfg.OIDC_CLIENT_ID_HEADER,
    ],
  })
);

let gtwcfg, oidc;
(async function () {
  try {
    gtwcfg = new GatewayConfig(syscfg.GATEWAY_CONFIG);
    oidc = initOidcProvider(broker);

    initMetrics(app);
    initRoutes(app, gtwcfg, broker, oidc);

    const server = app.listen(syscfg.PORT, () => {
      logger.info(`Running on port ${syscfg.PORT}`);
    });

    // Clean any internal header on WS upgrade as these requests are not intercepted by our express authentication HTTP middlewares
    // Instead, let prismeai-events authenticate reqs himself
    server.on('upgrade', function (req) {
      cleanIncomingRequest(req as any);
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
