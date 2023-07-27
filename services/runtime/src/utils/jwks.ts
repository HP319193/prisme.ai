import fs from 'fs';
import jose from 'node-jose';
import { DEBUG, JWKS, API_URL, OIDC_PROVIDER_URL } from '../../config';
import { ConfigurationError } from '../errors';
import { logger } from '../logger';

export async function sign(payload: any) {
  if (!JWKS) {
    logger.warn({
      msg: `Can't sign payload as no JWKS has been configured`,
      payload,
    });
    return false;
  }
  const keyStore = await jose.JWK.asKeyStore(JWKS);
  const [key] = keyStore.all({ use: 'sig' });
  const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } };

  const token = await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();
  return token;
}

export async function getAccessToken({
  userId,
  expiresIn,
  prismeaiSessionId,
}: {
  userId: string;
  expiresIn: number;
  prismeaiSessionId: string;
}) {
  const expires = new Date(Date.now() + expiresIn * 1000);
  const token = {
    exp: Math.floor(expires.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
    sub: userId,
    aud: API_URL,
    iss: OIDC_PROVIDER_URL,
    prismeaiSessionId,
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
  if (jwks?.keys?.kid === 'f262a3214213d194c92991d6735b153b' && !DEBUG) {
    logger.error({
      msg: 'Do not use default jwks.json in production environement, please generate a new one & keep it regularly rotated.',
    });
  }
  return jwks;
}
