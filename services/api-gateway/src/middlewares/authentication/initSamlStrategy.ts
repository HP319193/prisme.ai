import fs from 'fs';
import passport from 'passport';
import {
  Strategy as SamlStrategy,
  generateServiceProviderMetadata,
} from '@node-saml/passport-saml';
import { URL } from 'url';
import { EventType } from '../../eda';
import { SamlProviderConfig } from '../../services/identity';
import { Request } from 'express';
import { DeserializeUser } from './types';
import { syscfg } from '../../config';
import { logger } from '../../logger';

export async function initSamlStrategy(
  strategyName: string,
  config: SamlProviderConfig,
  deserializeUser: DeserializeUser
) {
  const callbackUrl = new URL('/v2/login/callback', syscfg.API_URL).toString();
  const strategy = new SamlStrategy(
    {
      passReqToCallback: true,
      callbackUrl,
      audience: config.audience || 'https://studio.prisme.ai/sp',
      authnRequestBinding: 'HTTP-POST',
      ...config,
    },
    async function (req: Request, profile, done: any) {
      const { nameIDFormat = '', nameID = '' } = profile || {};
      let email,
        id =
          nameIDFormat.slice(nameIDFormat.lastIndexOf(':') + 1) + ':' + nameID;
      if (nameIDFormat.endsWith(':emailAddress')) {
        email = nameID;
      }
      const user = await deserializeUser(
        {
          provider: strategyName,
          authData: {
            ...profile,
            id,
            email,
          },
        },
        done as any
      );
      if ((<any>user)?.newAccount) {
        req.broker
          .send(EventType.SucceededSignup, {
            ip: req.context?.http?.ip,
            user,
          })
          .catch((err: any) => req.logger.error({ err }));
      }
    },
    async function (req, profile, done) {
      req.logger.info({ msg: 'SAML strategy received logout call', profile });
    }
  );
  passport.use(strategyName, strategy);

  try {
    const metadata = generateServiceProviderMetadata({
      callbackUrl,
      issuer: config.issuer,
    });
    fs.writeFileSync(`saml-${strategyName}-metadata.xml`, metadata);
  } catch (err) {
    logger.info({
      msg: `Failed to export SAML service provider metadata`,
      err,
    });
  }
}
