import { v4 as uuid } from 'uuid';

export function generateToken() {
  return uuid();
}
