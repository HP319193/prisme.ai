import { validateAutomation } from './index';

it('should validate automation', () => {
  expect(validateAutomation({})).toBe(false);
  expect(validateAutomation('bar')).toBe(false);
  expect(validateAutomation([])).toBe(false);
  expect(validateAutomation({})).toBe(false);
  expect(
    validateAutomation({
      name: 'foo',
      do: '',
    })
  ).toBe(false);
  expect(
    validateAutomation({
      name: 'foo',
      do: [],
    })
  ).toBe(true);
  expect(
    validateAutomation({
      name: 'foo',
    })
  ).toBe(false);
  expect(
    validateAutomation({
      name: 'foo',
      do: [
        {
          prout: 'lol',
        },
      ],
    })
  ).toBe(true);
});
