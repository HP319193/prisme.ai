import fs from 'fs';
import jose from 'node-jose';
import jsonwebtoken from 'jsonwebtoken';
import { oidcCfg, syscfg } from '../../../config';
import { v4 as uuid } from 'uuid';
import { ConfigurationError } from '../../../types/errors';
import { logger } from '../../../logger';
import fetch from 'node-fetch';

/**
 * Prismeai JWKs management
 */

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

/**
 * External JWKs with PEM cert support (i.e some IdP like Google only provide PEM certs)
 */

type JWK = { kid: string };
type x509 = string;
type JWKS = Record<string, x509>; // PEM-converted JWKS mapped to their kid
const keystores: Record<string, JWKS> = {};

async function fetchJWKS(
  platform: string,
  jwksUri: string,
  kid: string
): Promise<x509 | undefined> {
  if (keystores[platform] && keystores[platform][kid]) {
    return keystores[platform][kid];
  }

  try {
    const req = await fetch(jwksUri);
    let jwks = await req.json();
    jwks = jwks?.keys || jwks;

    // Convert JWKS to Record<kid, PEM> mapping, as jsonwebtoken only handles PEM certs format
    if (Array.isArray(jwks)) {
      const convertedCerts = await Promise.all(
        (jwks as Array<JWK>).map(async (jwk) => {
          return {
            kid: jwk.kid,
            cert: (await jose.JWK.asKey(jwk)).toPEM(),
          };
        })
      );
      keystores[platform] = convertedCerts.reduce(
        (jwks, { kid, cert }) => ({
          ...jwks,
          [kid]: cert,
        }),
        {}
      );
    } else {
      keystores[platform] = jwks;
    }
  } catch (err) {
    logger.warn({
      msg: 'Error raised while loading IdP JWKS',
      err,
    });
    return undefined;
  }
  return keystores[platform][kid];
}

// https://openid.net/specs/openid-connect-core-1_0.html#IDToken
export type OidcIdToken = {
  iss: string;
  aud: string;
  sub: string; // User id at the IdP
  email: string;
  picture: string;
  name: string; // First name + last name
  given_name: string; // First name
  family_name: string; // last name
  locale: string;
  exp: number;
};
export async function verifyToken(
  token: string,
  platform: string,
  jwksUri: string
): Promise<OidcIdToken | false> {
  const decodedToken = jsonwebtoken.decode(token, { complete: true });

  if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
    throw new Error('JWT invalide');
  }

  const jwk = await fetchJWKS(platform, jwksUri, decodedToken.header.kid);
  if (!jwk) {
    logger.warn({
      msg: 'Could not verify JWT as IdP JWKS endpoint does not have specified kid',
      platform,
      kid: decodedToken.header.kid,
    });
    return false;
  }
  try {
    const jwt = jsonwebtoken.verify(token, jwk as any);
    return jwt as OidcIdToken;
  } catch (err) {
    logger.warn({
      msg: 'Could not verify JWT',
      platform,
      err,
      kid: decodedToken.header.kid,
    });
    return false;
  }
}
