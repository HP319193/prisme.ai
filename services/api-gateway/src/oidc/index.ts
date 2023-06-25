//@ts-ignore
import express, { NextFunction, Request, Response } from 'express';
import { oidcCfg } from '../config';
import RedisAdapter from './redis';
import ProviderType from 'oidc-provider';
import bodyParser from 'body-parser';
import services from '../services';
import { URL } from 'url';
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
        async claims(
          use: string,
          scope: string,
          claims: object,
          rejected: string[]
        ) {
          console.log('CLAIMS FOR ', use, scope, claims, rejected);
          console.log(user);
          return { ...user, sub };
        },
      };
    },

    interactions: {
      url: function interactionUrl(_: any, interaction: any) {
        console.log('HEYYY : ', JSON.stringify(interaction, null, 2));
        if (interaction.prompt.name === 'consent') {
          // This is where we should instead redirect to a front end page asking for consent (which would be processed by the below url)
          const url = new URL(
            `/oidc/interaction/${interaction.uid}`,
            oidcCfg.PROVIDER_URL
          );
          return url.toString();
        }
        return `${oidcCfg.LOGIN_FORM}?interaction=${interaction.uid}`;
      },
    },
  });
};

const getLoginPage = (details: any, err: any = '') => `
<html>
  <head>
    <title>Sign in</title>
  </head>
  <body>
  <center style="color:red">${err}</center>
  <form autocomplete="off" action="/oidc/interaction/${
    details.uid
  }/login" method="post">
  <input type="hidden" name="uuid" value="${details.uid}"/>
  <input required type="text" name="login" placeholder="Enter any login"
    ${
      !details.params.login_hint
        ? 'autofocus="on"'
        : `value="${details.params.login_hint}"`
    }
  />
  <input required type="password" name="password" placeholder="and password"
    ${details.params.login_hint ? 'autofocus="on"' : ''}
  />

  <label><input type="checkbox" name="remember" value="yes" checked="yes">Stay signed in</label>

  <button type="submit" class="login login-submit">Sign-in</button>
</form>
  </body>
</html>`;

export function initRoutes() {
  const app = express.Router();
  const provider = initOidcProvider();

  // Implement interactive user flow
  app.get(
    '/interaction/:grant',
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('OULLAAOULAAAOULAA');
      const details = await provider.interactionDetails(req, res);
      const client = await provider.Client.find(
        details.params.client_id as string
      );
      console.log('GOOOOT ', JSON.stringify(details, null, 2));
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
        // const missingResourceScopes = (details.prompt.details.missingResourceScopes || []) as string[];
        if (missingOIDCScope?.length) {
          grant.addOIDCScope(missingOIDCScope.join(' '));
        }
        if (missingOIDCClaims?.length) {
          grant.addOIDCClaims(missingOIDCClaims);
        }
        // if (missingResourceScopes?.length) {
        //   for (const [indicator, scope] of Object.entries(missingResourceScopes)) {
        //     grant.addResourceScope(indicator, scope.join(' '));
        //   }
        // }
        const result = { consent: { grantId: await grant.save() } };
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: true,
        });
      } else {
        res.send(getLoginPage(details));
      }
      await next();

      // TODO essayer de reproduire le cas du else qui renvoie direct interaction (bouton continue vers /interaction/{uid}/confirm)
      // if (details.interaction.error === 'login_required') {
      //   await ctx.render('login', {
      //     client,
      //     details,
      //     title: 'Sign-in',
      //     debug: querystring.stringify(details.params, ',<br/>', ' = ', {
      //       encodeURIComponent: (value) => value,
      //     }),
      //     interaction: querystring.stringify(
      //       details.interaction,
      //       ',<br/>',
      //       ' = ',
      //       {
      //         encodeURIComponent: (value) => value,
      //       }
      //     ),
      //   });
      // } else {
      //   await ctx.render('interaction', {
      //     client,
      //     details,
      //     title: 'Authorize',
      //     debug: querystring.stringify(details.params, ',<br/>', ' = ', {
      //       encodeURIComponent: (value) => value,
      //     }),
      //     interaction: querystring.stringify(
      //       details.interaction,
      //       ',<br/>',
      //       ' = ',
      //       {
      //         encodeURIComponent: (value) => value,
      //       }
      //     ),
      //   });
      // }

      // await next();
    }
  );

  const body = bodyParser();
  // Called by Continue button
  // a priori useless, jamais appelé, on peut dégager
  // app.post(
  //   '/interaction/:grant/confirm',
  //   body,
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     const result = { consent: {} };
  //     console.log('CALL INTERACTION CONFIRM ', req);
  //     await provider.interactionFinished(req, res, result);
  //     await next();
  //   }
  // );
  app.post(
    '/interaction/:grant/login',
    body,
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('CALL INTERACTION LOGIN WIh ', req.body, req.params);
      const identity = services.identity(req.context, req.logger);
      const { login, password, remember } = req.body;
      try {
        const account = await identity.login(login, password);
        const result = {
          login: {
            accountId: account.id!,
            // TODO whats acr & amr ?
            acr: 'urn:mace:incommon:iap:bronze',
            amr: ['pwd'],
            remember: !!remember,
            ts: Math.floor(Date.now() / 1000),
          },
          consent: {},
        };
        console.log('FINISH ', result);
        await provider.interactionFinished(req, res, result);
        await next();
        return;
      } catch (err) {
        throw err;
        const details = await provider.interactionDetails(req, res);
        return res.send(getLoginPage(details, `${err}`));
      }
    }
  );

  // Implement native OIDC routes : /auth, /token, /token/introspection, ...
  app.use(provider.callback());

  return app;
}
