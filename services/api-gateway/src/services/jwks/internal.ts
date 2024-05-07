import fetch from 'node-fetch';
import { GatewayConfig, syscfg } from '../../config';
import { JWK } from './types';
import { JWKStore } from './store';
import { URL } from 'url';
import { logger } from '../../logger';

export async function publishJWKToRuntime(
  gtwcfg: GatewayConfig,
  jwks: JWKStore
) {
  const key = jwks.store?.keys?.[0];
  if (!key) {
    return;
  }
  try {
    const res = await publishInternalPrivateJWK(
      new URL('/sys/certs', gtwcfg.config.services.runtime.url).toString(),
      key
    );
    logger.info({
      msg: `Sucessfully updated ${gtwcfg.config.services.runtime.url} with new signing JWK`,
      res,
    });
  } catch (err) {
    logger.error({
      msg: `Failed updating ${gtwcfg.config.services.runtime.url} with new signing JWK`,
      err,
    });
  }
}

async function publishInternalPrivateJWK(url: string, jwk: JWK) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [syscfg.API_KEY_HEADER]: syscfg.INTERNAL_API_KEY,
    },
    body: JSON.stringify({
      jwk,
    }),
  });
  const json = await res.json();
  if (res.status >= 400 && res.status < 600) {
    throw json;
  }
  return json;
}
