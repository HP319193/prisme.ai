import { applyCommands } from './commands';

it('should apply commands', () => {
  expect(applyCommands({ foo: 'bar' }, { bar: 'foo' })).toEqual({
    foo: 'bar',
    bar: 'foo',
  });
  expect(applyCommands({ foo: 'bar' }, { foo: 'foo' })).toEqual({
    foo: 'foo',
  });
});

it('should apply $merge commands', () => {
  expect(applyCommands({ foo: ['bar'] }, { $merge: { foo: ['foo'] } })).toEqual(
    {
      foo: ['bar', 'foo'],
    }
  );

  expect(
    applyCommands(
      {
        foo: {
          one: 1,
        },
      },
      {
        $merge: {
          foo: {
            two: 2,
          },
        },
      }
    )
  ).toEqual({
    foo: {
      one: 1,
      two: 2,
    },
  });

  expect(
    applyCommands(
      {
        foo: 'f',
      },
      {
        $merge: {
          foo: 'oo',
        },
      }
    )
  ).toEqual({
    foo: 'foo',
  });

  expect(
    applyCommands(
      {
        foo: 41,
      },
      {
        $merge: {
          foo: 1,
        },
      }
    )
  ).toEqual({
    foo: 42,
  });

  expect(
    applyCommands(
      {
        foo: true,
      },
      {
        $merge: {
          foo: false,
        },
      }
    )
  ).toEqual({
    foo: false,
  });

  expect(
    applyCommands(
      {
        things: {
          list: [{ id: 1 }],
        },
      },
      {
        $merge: {
          'things.list': [
            {
              id: 2,
            },
          ],
        },
      }
    )
  ).toEqual({
    things: {
      list: [{ id: 1 }, { id: 2 }],
    },
  });
});
