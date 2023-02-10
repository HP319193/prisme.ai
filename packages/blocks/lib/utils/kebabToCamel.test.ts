import { kebabToCamel, keysKebabToCamel } from './kebabToCamel';

it('shoud convert kebab to camel', () => {
  expect(kebabToCamel('abc-def-ghi')).toBe('abcDefGhi');
  expect(kebabToCamel('-abc-def-ghi')).toBe('AbcDefGhi');
  expect(kebabToCamel('-abc-def-ghi-')).toBe('AbcDefGhi-');
});

it('shoud convert object keys from kebab to camel', () => {
  expect(
    keysKebabToCamel({
      'abc-def-ghi': 1,
      '-abc-def-ghi': 2,
      '-abc-def-ghi-': 3,
    })
  ).toEqual({ abcDefGhi: 1, AbcDefGhi: 2, 'AbcDefGhi-': 3 });
});
