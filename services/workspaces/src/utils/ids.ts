import crypto, { webcrypto } from 'crypto';
import { TextEncoder } from 'util';

export function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

export function token() {
  return crypto.randomBytes(64).toString('hex');
}

export async function temporaryToken(
  secret: string,
  expiresAt: number,
  id: string
): Promise<{ token: string; length: number }> {
  const tokenContent = `${secret}${id}${expiresAt}`;
  const tokenHash = new TextEncoder().encode(tokenContent);
  const digest = await (webcrypto as any).subtle.digest(
    {
      name: 'SHA-256',
    },
    tokenHash
  );
  // Turn it into a hex string
  const hexString = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Append expiresAt hex at the end so the token expiration can be validated
  return {
    token: hexString + expiresAt.toString(16),
    length: hexString.length,
  };
}

export async function validateTemporaryToken(
  secret: string,
  id: string,
  token: string
) {
  // Re generate a token from given secret/id to get base token length & extract the ending expiresAt part
  const { length: tokenSize } = await temporaryToken(secret, Date.now(), id);
  const expiresAt = parseInt(token.slice(tokenSize), 16);
  if (Number.isNaN(expiresAt)) {
    return false;
  }
  if (Date.now() > expiresAt) {
    // Expired
    return false;
  }
  // Valid token ,
  const { token: expectedToken } = await temporaryToken(secret, expiresAt, id);
  return token === expectedToken;
}
