import { incrementName } from './incrementName';

it('should generate new name', () => {
  expect(incrementName('foo', ['foo', 'bar'])).toBe('foo (1)');
});

it('should generate new name with many versions', () => {
  expect(
    incrementName('foo', ['foo', 'bar', 'foo (1)', 'barbar', 'foo (2)'])
  ).toBe('foo (3)');
});

it('should generate new name with custom template', () => {
  expect(incrementName('foo', ['foo', 'bar'], '{{name}} - copy {{n}}')).toBe(
    'foo - copy 1'
  );
});

it('should generate new name from templated original name', () => {
  expect(
    incrementName('foo-2', ['foo', 'foo-1', 'foo-2'], '{{name}}-{{n}}')
  ).toBe('foo-3');
  expect(
    incrementName(
      'some name with space-1',
      ['some name with space', 'some name with space-1'],
      '{{name}}-{{n}}'
    )
  ).toBe('some name with space-2');
  expect(
    incrementName(
      'prefix some name with space-1',
      ['some name with space', 'prefix some name with space-1'],
      'prefix {{name}}-{{n}}'
    )
  ).toBe('prefix some name with space-2');
});
it('should not try to clean original name', () => {
  expect(
    incrementName('tame-mouse-20', ['tame-mouse-20'], '{{name}}-{{n}}', {
      keepOriginal: true,
    })
  ).toBe('tame-mouse-20-1');
});
