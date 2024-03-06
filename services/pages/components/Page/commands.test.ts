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

it('should apply merge', () => {
  expect(
    applyCommands(
      {
        lang: 'fr',
        files: {
          list: [
            {
              id: '084baa3984834813965232a9023bc341',
              name: '27',
              text: '27',
              updatedAt: '2024-02-26T15:17:12.374Z',
              status: 'published',
              link: 'https://honest-dodo-48.pages.prisme.ai/content?id=084baa3984834813965232a9023bc341',
              kind: 'text',
            },
          ],
          hasMore: true,
          filters: {
            id: '65dc6770acc0eb662e291e6c',
            search: '',
            sortDesc: true,
          },
        },
      },
      {
        $merge: {
          'files.list': [
            {
              id: '1a2b0f3a4b5e4066b19f1339d8d3aad2',
              name: '16',
              text: '16',
              updatedAt: '2024-02-26T14:16:13.135Z',
              status: 'published',
              link: 'https://honest-dodo-48.pages.prisme.ai/content?id=1a2b0f3a4b5e4066b19f1339d8d3aad2',
              kind: 'text',
            },
          ],
          'files.hasMore': true,
          'files.filters.page': 1,
        },
      }
    )
  ).toEqual({
    lang: 'fr',
    files: {
      list: [
        {
          id: '084baa3984834813965232a9023bc341',
          name: '27',
          text: '27',
          updatedAt: '2024-02-26T15:17:12.374Z',
          status: 'published',
          link: 'https://honest-dodo-48.pages.prisme.ai/content?id=084baa3984834813965232a9023bc341',
          kind: 'text',
        },
        {
          id: '1a2b0f3a4b5e4066b19f1339d8d3aad2',
          name: '16',
          text: '16',
          updatedAt: '2024-02-26T14:16:13.135Z',
          status: 'published',
          link: 'https://honest-dodo-48.pages.prisme.ai/content?id=1a2b0f3a4b5e4066b19f1339d8d3aad2',
          kind: 'text',
        },
      ],
      hasMore: true,
      filters: {
        id: '65dc6770acc0eb662e291e6c',
        search: '',
        sortDesc: true,
        page: 1,
      },
    },
  });
});

it('should apply replace commands', () => {
  expect(
    applyCommands(
      { foo: { bar: 1, other: true } },
      { $replace: { 'foo.bar': 2 } }
    )
  ).toEqual({ foo: { bar: 2, other: true } });
});
