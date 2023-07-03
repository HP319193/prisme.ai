//@ts-ignore
import express, { NextFunction, Request, Response } from 'express';
import { oidcCfg } from '../config';
import RedisAdapter from './redis';
import ProviderType, { InteractionResults } from 'oidc-provider';
import bodyParser from 'body-parser';
import services from '../services';
import { URL } from 'url';
import { PrismeError } from '../types/errors';
const Provider = require('fix-esm').require('oidc-provider').default;

const initOidcProvider = (): ProviderType => {
  return new Provider(oidcCfg.PROVIDER_URL, {
    ...oidcCfg.CONFIGURATION,
    adapter: RedisAdapter,
    // @param request
    // @param sub {string} - account identifier (subject)
    // @param token - is a reference to the token used for which a given account is being loaded,
    //   is undefined in scenarios where claims are returned from authorization endpoint
    findAccount: async function findAccount(_: any, sub: string, __: string) {
      const identity = services.identity();
      const user = await identity.get(sub);
      return {
        accountId: sub,
        // @param use {string} - can either be "id_token" or "userinfo", depending on
        //   where the specific claims are intended to be put in
        // @param scope {string} - the intended scope, while oidc-provider will mask
        //   claims depending on the scope automatically you might want to skip
        //   loading some claims from external resources or through db projection etc. based on this
        //   detail or not return them in ID Tokens but only UserInfo and so on
        // @param claims {object} - the part of the claims authorization parameter for either
        //   "id_token" or "userinfo" (depends on the "use" param)
        // @param rejected {Array[String]} - claim names that were rejected by the end-user, you might
        //   want to skip loading some claims from external resources or through db projection
        async claims() {
          return { ...user, sub };
        },
      };
    },

    interactions: {
      url: async function interactionUrl(ctx: any, interaction: any) {
        if (
          interaction.prompt.name === 'consent' ||
          interaction.params.acr_values === 'anonymous'
        ) {
          // In case of consent, this is where we should instead redirect to a front end page asking for consent (which would be processed by the below url)
          const url = new URL(
            `/oidc/interaction/${interaction.uid}`,
            oidcCfg.PROVIDER_URL
          );
          return url.toString();
        }
        // const client = await provider.Client.find(
        //   details.params.client_id as string
        // );
        // Pages client : build pages signin url
        const requestURL = new URL(ctx.request.url, oidcCfg.PROVIDER_URL);
        const locale = requestURL.searchParams.get('locale');
        const signinPath = locale
          ? `/${locale}${oidcCfg.LOGIN_PATH}`
          : oidcCfg.LOGIN_PATH;
        if (
          interaction.params.client_id.startsWith(
            oidcCfg.OIDC_PAGES_CLIENT_ID_PREFIX
          )
        ) {
          const workspaceSlug = interaction.params.client_id.slice(
            oidcCfg.OIDC_PAGES_CLIENT_ID_PREFIX.length
          );
          const protocol = (oidcCfg.STUDIO_LOGIN_FORM_URL || '').startsWith(
            'http://'
          )
            ? 'http://'
            : 'https://';
          return `${protocol}${workspaceSlug}${oidcCfg.PAGES_HOST}${signinPath}?interaction=${interaction.uid}`;
        }

        // Needs credentials, redirect to login form
        return `${oidcCfg.STUDIO_LOGIN_FORM_URL}${signinPath}?interaction=${interaction.uid}`;
      },
    },
  });
};

export function initRoutes() {
  const app = express.Router();
  const provider = initOidcProvider();

  // Implement interactive user flow
  app.get(
    '/interaction/:grant',
    async (req: Request, res: Response, next: NextFunction) => {
      let result: InteractionResults = {};
      const details = await provider.interactionDetails(req, res);
      const client = await provider.Client.find(
        details.params.client_id as string
      );

      // Anonymous login : no UI interaction needed, just create an anonymous user
      if (details.params.acr_values === 'anonymous') {
        const users = services.identity(req.context, req.logger);
        const anonymousUser = await users.anonymousLogin();
        result.login = {
          accountId: anonymousUser.id!,
        };
        details.session = {
          ...details.session,
          accountId: anonymousUser.id!,
        } as any;
        details.prompt.name = 'consent';
      }

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
        throw err;
      }
    }
  );

  // Implement native OIDC routes : /auth, /token, /token/introspection, ...
  app.use(provider.callback());

  return app;
}
