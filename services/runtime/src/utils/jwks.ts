import fs from 'fs';
import jose from 'node-jose';
import { API_URL, OIDC_PROVIDER_URL } from '../../config';
import { ConfigurationError } from '../errors';
import { logger } from '../logger';
import { Cache } from '../cache';
import { Broker } from '@prisme.ai/broker';

const JWK_CACHE_KEY = 'runtime:jwk';
const JWK_UPDATE_EVENT = 'runtime.jwks.updated';
interface CacheJWK {
  key: object;
}

let keyStore: jose.JWK.KeyStore | undefined = undefined;
export async function initJWKStore(
  broker: Broker,
  cache: Cache,
  filepath?: string
) {
  const initKeystore = async () => {
    const jwk = await cache.getObject<CacheJWK>(JWK_CACHE_KEY);
    if (jwk?.key) {
      const jwks = {
        keys: [jwk.key],
      };
      keyStore = await jose.JWK.asKeyStore(jwks);
      return true;
    }
    return false;
  };

  // Start JWK synchronisation by event
  broker.on(
    JWK_UPDATE_EVENT,
    async (event) => {
      if (
        event?.source?.host?.replica &&
        event?.source?.host?.replica === broker.consumer.name
      ) {
        return true;
      }
      logger.info({
        msg: `Reloading JWKS store`,
      });
      await initKeystore();
      return true;
    },
    {
      GroupPartitions: false, // Every instance must be kept in sync with jwks store
    }
  );

  // Init jwk store from our cache
  if ((await initKeystore()) || !filepath) {
    return;
  }

  // Legacy migration : use default jwk from ile
  try {
    const jwks = await getJWKFromFile(filepath);
    keyStore = await jose.JWK.asKeyStore(jwks);

    cache
      .setObject(JWK_CACHE_KEY, {
        key: jwks?.keys?.[0],
      })
      .catch(logger.error);
  } catch (err) {
    logger.error({
      msg: `Can't initiate JWKS from file at '${filepath}'`,
      err,
    });
  }
}

export async function updateRuntimeJWK(
  broker: Broker,
  cache: Cache,
  jwk: object
) {
  keyStore = await jose.JWK.asKeyStore({
    keys: [jwk],
  });
  await cache.setObject(JWK_CACHE_KEY, {
    key: jwk,
  });
  broker
    .send(
      JWK_UPDATE_EVENT,
      {},
      {},
      {},
      {
        disableValidation: true,
      }
    )
    .catch(logger.error);
}

export async function getAccessToken({
  userId,
  expiresIn,
  prismeaiSessionId,
  correlationId,
}: {
  userId: string;
  expiresIn: number;
  prismeaiSessionId: string;
  correlationId?: string;
}) {
  const expires = new Date(Date.now() + expiresIn * 1000);
  const token = {
    exp: Math.floor(expires.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
    sub: userId,
    aud: API_URL,
    iss: OIDC_PROVIDER_URL,
    prismeaiSessionId,
    correlationId,
  };
  const jwt = await sign(token);
  return {
    token,
    jwt,
    expires: expires.toISOString(),
  };
}

async function sign(payload: any) {
  if (!keyStore) {
    logger.warn({
      msg: `Can't sign payload as no JWKS has been configured`,
      payload,
    });
    return false;
  }

  const [key] = keyStore.all({ use: 'sig' });
  const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } };

  const token = await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();
  return token;
}

function getJWKFromFile(filepath: string) {
  let json;
  try {
    json = fs.readFileSync(filepath);
  } catch (err) {
    throw new ConfigurationError(`Can't find JWKS file at '${filepath}'`, {
      err,
    });
  }
  const jwks = JSON.parse(json.toString());
  return jwks;
}
