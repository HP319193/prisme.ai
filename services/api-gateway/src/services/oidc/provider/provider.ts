//@ts-ignore
import express, { NextFunction, Request, Response } from 'express';
import { oidcCfg } from '../../../config';
import RedisAdapter from './redis';
import ProviderType from 'oidc-provider';
import services from '../../../services';
import { URL } from 'url';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { logger } from '../../../logger';
const Provider = require('fix-esm').require('oidc-provider').default;

export const initOidcProvider = (broker: Broker): ProviderType => {
  const provider = new Provider(oidcCfg.PROVIDER_URL, {
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
        if (interaction.prompt.name === 'consent') {
          // This is where we should instead redirect to a front end page asking for consent (which would be processed by the below url)
          const url = new URL(
            `/oidc/interaction/${interaction.uid}`,
            oidcCfg.PROVIDER_URL
          );
          return url.toString();
        }
        // Pages client : build pages signin url
        const requestURL = new URL(ctx.request.url, oidcCfg.PROVIDER_URL);
        const locale = requestURL.searchParams.get('locale');
        const signinPath = locale
          ? `/${locale}${oidcCfg.LOGIN_PATH}`
          : oidcCfg.LOGIN_PATH;
        const client = await provider.Client.find(interaction.params.client_id);
        if (client.workspaceSlug) {
          const protocol = (oidcCfg.STUDIO_URL || '').startsWith('http://')
            ? 'http://'
            : 'https://';
          return `${protocol}${client.workspaceSlug}${oidcCfg.PAGES_HOST}${signinPath}?interaction=${interaction.uid}`;
        }

        // Needs credentials, redirect to login form
        return `${oidcCfg.STUDIO_URL}${signinPath}?interaction=${interaction.uid}`;
      },
    },
  });

  provider.on('access_token.issued', async (token: any) => {
    const identity = services.identity();
    let email = undefined,
      authData = {};
    try {
      const user = await identity.get(token.accountId);
      email = user.email;
      authData = user.authData || {};
    } catch {}

    broker
      .send<Prismeai.SucceededLogin['payload']>(EventType.SucceededLogin, {
        id: token.accountId,
        email,
        authData: {
          ['prismeai']: authData,
        },
        session: {
          id: token.sessionUid,
          expiresIn: token.expiresIn,
          expires: new Date(Date.now() + token.expiresIn * 1000).toISOString(),
        },
      })
      .catch(logger.warn);
  });

  return provider;
};
