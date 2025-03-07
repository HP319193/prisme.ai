//@ts-ignore
import express, { NextFunction, Request, Response } from 'express';
import Provider, { InteractionResults } from 'oidc-provider';
import bodyParser from 'body-parser';
import services from '../..';
import { PrismeError } from '../../../types/errors';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { logger } from '../../../logger';
import { oidcCfg, syscfg } from '../../../config';
import { init as initRateLimit } from '../../../policies/rateLimit';

export async function initRoutes(broker: Broker, provider: Provider) {
  const app = express.Router();

  // Implement interactive user flow
  app.get(
    '/interaction/:grant',
    async (req: Request, res: Response, next: NextFunction) => {
      let result: InteractionResults = {};
      const details = await provider.interactionDetails(req, res);
      const client = await provider.Client.find(
        details.params.client_id as string
      );

      // Consents
      if (details.prompt.name === 'consent' && details.session && client) {
        let grant: any;
        if (details.grantId) {
          grant = await provider.Grant.find(details.grantId);
        } else {
          grant = new provider.Grant({
            accountId: details.session.accountId,
            clientId: client?.clientId,
          });
        }

        const missingOIDCScope = (details.prompt.details.missingOIDCScope ||
          []) as string[];
        const missingOIDCClaims = (details.prompt.details.missingOIDCClaims ||
          []) as string[];
        const missingResourceScopes = (details.prompt.details
          .missingResourceScopes || {}) as Record<string, string[]>;

        if (missingOIDCScope?.length) {
          grant.addOIDCScope(missingOIDCScope.join(' '));
        }
        if (missingOIDCClaims?.length) {
          grant.addOIDCClaims(missingOIDCClaims);
        }
        if (Object.keys(missingResourceScopes).length) {
          for (const [indicator, scopes] of Object.entries(
            missingResourceScopes
          )) {
            grant.addResourceScope(indicator, scopes.join(' '));
          }
        }
        result.consent = { grantId: await grant.save() };
      } else {
        throw new PrismeError(
          'Login form should not be rendered from there, but redirected to instead.',
          { interaction: details },
          400
        );
      }

      // Save our updated interaction
      if (Object.keys(result).length) {
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: true,
        });
      }
      await next();
    }
  );

  // Credentials form submission
  const body = bodyParser();
  const prismeaiLoginRateLimit = await initRateLimit({
    window: 60,
    limit: syscfg.RATE_LIMIT_PRISMEAI_LOGIN,
    key: (req) => {
      return req.body?.login || 'ip';
    },
    name: 'prismeaiLogin',
  });
  app.post(
    '/interaction/:grant/login',
    body,
    prismeaiLoginRateLimit,
    async (req: Request, res: Response, next: NextFunction) => {
      const identity = services.identity(req.context, req.logger);
      const { login, password, remember } = req.body;
      try {
        const account = await identity.login(login, password);
        const result = {
          login: {
            accountId: account.id!,
            acr: 'urn:mace:incommon:iap:bronze',
            amr: ['pwd'],
            remember: !!remember,
            ts: Math.floor(Date.now() / 1000),
          },
          consent: {},
        };
        await provider.interactionFinished(req, res, result);
        await next();
        return;
      } catch (err) {
        broker
          .send(EventType.FailedLogin, {
            email: login,
            ip: req.ip || req.context?.http?.ip,
          })
          .catch((err) => logger.warn({ err }));
        throw err;
      }
    }
  );

  // Add post-processing middleware to native OIDC routes
  provider.use(async (ctx, next) => {
    await next();
    /** post-processing */
    if (ctx?.oidc?.route === 'token' && ctx?.response?.body?.access_token) {
      const expires = new Date(
        new Date().valueOf() + ctx.response.body.expires_in * 1000
      );
      ctx.cookies.set(
        oidcCfg.ACCESS_TOKENS_NAME,
        ctx.response.body.access_token,
        {
          ...oidcCfg.ACCESS_TOKENS_OPTIONS,
          expires,
        }
      );
    }
    if (
      ['end_session', 'end_session_success', 'end_session_confirm'].includes(
        ctx?.oidc?.route
      )
    ) {
      ctx.cookies.set(
        oidcCfg.ACCESS_TOKENS_NAME,
        '',
        oidcCfg.ACCESS_TOKENS_OPTIONS
      );
    }
  });

  // Implement native OIDC routes : /auth, /token, /token/introspection, ...
  app.use(provider.callback());

  return app;
}
