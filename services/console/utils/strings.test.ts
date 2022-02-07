import { utimes } from 'fs';
import { truncate } from './strings';

it('should truncate', () => {
  expect(truncate('abc', 10, '…')).toBe('abc');
  expect(truncate('abcdefghijklmn', 10, '…')).toBe('abcdefghij…');
  expect(truncate('abcdefghijklmn', 10, '💥')).toBe('abcdefghij💥');
});
