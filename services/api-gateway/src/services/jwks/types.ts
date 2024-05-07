export type JWK = { kid: string; alg: string; [k: string]: string };
export type PrismeaiJWK = {
  kid: string;
  previousKeyId?: string; // Last active JWK before this one
  createdAt: string;
  rotatesAt: string; // When this jwk is no longer used for signing jwt
  expiresAt: string; // When this jwk is no longer used for verifying signed jwts
  jwk: JWK;
};
