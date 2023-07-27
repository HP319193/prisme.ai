import fs from 'fs';
import jose from 'node-jose';
import { oidcCfg, syscfg } from '../../../config';
import { v4 as uuid } from 'uuid';
import { ConfigurationError } from '../../../types/errors';
import { logger } from '../../../logger';

export async function sign(payload: any) {
  const keyStore = await jose.JWK.asKeyStore(oidcCfg.CONFIGURATION.jwks!);
  const [key] = keyStore.all({ use: 'sig' });
  const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } };

  const token = await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();
  return token;
}

export async function getAccessToken(userId: string) {
  const expires = new Date(Date.now() + oidcCfg.ACCESS_TOKENS_MAX_AGE * 1000);
  // Mimic OIDC emitted JWT tokens so we can validate / handle these anonymous session exactly like for OIDC tokens
  const token = {
    exp: Math.floor(expires.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
    sub: userId,
    iss: oidcCfg.PROVIDER_URL,
    aud: syscfg.API_URL,
    prismeaiSessionId: uuid(),
  };
  const jwt = await sign(token);
  return {
    token,
    jwt,
    expires: expires.toISOString(),
  };
}

export function getJWKS(filepath: string) {
  let json;
  try {
    json = fs.readFileSync(filepath);
  } catch (err) {
    throw new ConfigurationError(`Can't find JWKS file at '${filepath}'`, {
      err,
    });
  }
  const jwks = JSON.parse(json.toString());
  if (jwks?.keys?.kid === 'f262a3214213d194c92991d6735b153b' && !syscfg.DEBUG) {
    logger.error({
      msg: 'Do not use default jwks.json in production environement, please generate a new one & keep it regularly rotated.',
    });
  }
  return jwks;
}
