import { toKebab } from './toKebab';

it('shoud convert to kebab', () => {
  expect(toKebab('abc def ghi')).toBe('abc-def-ghi');
  expect(toKebab('abc DEF ghi')).toBe('abc-DEF-ghi');
});
