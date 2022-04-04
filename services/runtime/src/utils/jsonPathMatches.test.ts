import { jsonPathMatches } from './jsonPathMatches';

it('Simple equality', () => {
  expect(
    jsonPathMatches(
      {
        foo: 'foo',
      },
      {
        foo: 'foo',
      }
    )
  ).toBe(true);

  expect(
    jsonPathMatches(
      {
        foo: 'foo',
      },
      {
        foo: 'foos',
      }
    )
  ).toBe(false);
});

it('Nested equality', () => {
  expect(
    jsonPathMatches(
      {
        'foo.bar': 'bar',
      },
      {
        foo: {
          bar: 'bar',
        },
      }
    )
  ).toBe(true);

  expect(
    jsonPathMatches(
      {
        'foo.bar': 'bar',
      },
      {
        foo: 'foo',
      }
    )
  ).toBe(false);
});
