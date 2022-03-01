import { extractObjectsByPath } from './extractObjectsByPath';

it('Can extract a single key path', () => {
  const root = {
    one: 1,
  };
  expect(extractObjectsByPath(root, 'one')).toMatchObject([
    {
      lastKey: 'one',
      path: ['one'],
      value: 1,
    },
  ]);
});

it('An unknown root path returns nothing', () => {
  const root = {
    one: 1,
  };
  expect(extractObjectsByPath(root, 'blah')).toMatchObject([]);
});

it('An unknown nested path returns nothing', () => {
  const root = {
    one: {
      two: 2,
    },
  };
  expect(extractObjectsByPath(root, 'one.ok')).toMatchObject([]);
});

it('Can extract a length 2 path', () => {
  const root = {
    one: 1,
    oneBis: {
      two: 2,
    },
  };
  expect(extractObjectsByPath(root, 'oneBis.two')).toMatchObject([
    {
      lastKey: 'two',
      path: ['oneBis', 'two'],
      value: 2,
    },
  ]);
});

it('A final wildcard returns every keys from current object', () => {
  const root = {
    one: 1,
    oneBis: {
      two: 2,
      three: 3,
    },
  };
  expect(extractObjectsByPath(root, 'oneBis.*')).toMatchObject([
    {
      lastKey: 'two',
      path: ['oneBis', 'two'],
      value: 2,
    },
    {
      lastKey: 'three',
      path: ['oneBis', 'three'],
      value: 3,
    },
  ]);
});

it('A final wildcard returns every keys from current array', () => {
  const root = {
    one: 1,
    oneBis: [{ two: 2 }, { three: 3 }],
  };
  expect(extractObjectsByPath(root, 'oneBis.*')).toMatchObject([
    {
      lastKey: '0',
      path: ['oneBis', '0'],
      value: { two: 2 },
    },
    {
      lastKey: '1',
      path: ['oneBis', '1'],
      value: { three: 3 },
    },
  ]);
});
