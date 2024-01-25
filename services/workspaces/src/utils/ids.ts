import crypto from 'crypto';

export function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

export function token() {
  return crypto.randomBytes(64).toString('hex');
}
