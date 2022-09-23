import { removeEmpty, search } from './filterUtils';

it('should remove empty items', () => {
  expect(['a', , , , 'b', null, '', , 0].filter(removeEmpty)).toEqual([
    'a',
    'b',
  ]);
});

it('should search', () => {
  expect(
    ['lorem', 'Ipsum', 'foo ipsum bar', 'ipsum', 'ip sum'].filter(search('ips'))
  ).toEqual(['Ipsum', 'foo ipsum bar', 'ipsum']);
});

it('should search in object', () => {
  expect(
    [
      { name: 'ipsum', description: 'something else' },
      { name: 'lorem', description: 'something else' },
      { name: 'foo', description: 'IPSUM' },
    ].filter(({ name, description }) => search('ips')(`${name} ${description}`))
  ).toEqual([
    { name: 'ipsum', description: 'something else' },
    { name: 'foo', description: 'IPSUM' },
  ]);
});
