import { stringToHexaColor, truncate } from './strings';

it('should truncate', () => {
  expect(truncate('abc', 10, '…')).toBe('abc');
  expect(truncate('abcdefghijklmn', 10, '…')).toBe('abcdefghij…');
  expect(truncate('abcdefghijklmn', 10, '💥')).toBe('abcdefghij💥');
  expect(truncate(undefined, 10, '…')).toBe('');
  expect(truncate(null as any, 10, '…')).toBe('');
  expect(truncate({} as any, 10, '…')).toBe('[object Ob…');
  expect(truncate(1 as any, 10, '…')).toBe('1');
});

it('should convert a string to hexa', () => {
  expect(stringToHexaColor('foo bar')).toBe('2aac15');
  expect(stringToHexaColor('Prisme.ai')).toBe('9ac914');
  expect(stringToHexaColor('💎🤖')).toBe('dad2fd');
});
