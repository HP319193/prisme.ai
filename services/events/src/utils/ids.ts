import crypto from 'crypto';

export function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}
