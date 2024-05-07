import jose from 'node-jose';
import jsonwebtoken from 'jsonwebtoken';
import { logger } from '../../logger';
import fetch from 'node-fetch';
import { JWK } from './types';

/**
 * External JWKs with PEM cert support (i.e some IdP like Google only provide PEM certs, which jsonwebtoken doesn't support)
 */

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
