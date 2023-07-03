//@ts-ignore
import express, { NextFunction, Request, Response } from 'express';
import { InteractionResults } from 'oidc-provider';
import bodyParser from 'body-parser';
import services from '../services';
import { PrismeError } from '../types/errors';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../eda';
import { logger } from '../logger';
import { initOidcProvider } from './provider';

export function initRoutes(broker: Broker) {
  const app = express.Router();
  const provider = initOidcProvider(broker);

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
  app.post(
    '/interaction/:grant/login',
    body,
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
        req.broker
          .send(EventType.FailedLogin, {
            email: login,
            ip: req.context?.http?.ip,
          })
          .catch(logger.warn);
        throw err;
      }
    }
  );

  // Implement native OIDC routes : /auth, /token, /token/introspection, ...
  app.use(provider.callback());

  return app;
}
