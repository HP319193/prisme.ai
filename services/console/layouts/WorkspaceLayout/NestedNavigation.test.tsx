import { buildNestedTree } from './NestedNavigation';

it('should build nested tree', () => {
  expect(
    buildNestedTree([
      {
        path: 'a single name',
      },
      {
        path: 'folder/truc',
      },
      {
        path: 'folder/chose',
      },
      {
        path: 'folder/chose/truc',
      },
    ])
  ).toEqual([
    {
      path: 'folder',
      items: [
        {
          path: 'chose',
          items: [
            {
              path: 'truc',
              items: [],
            },
          ],
        },
        {
          path: 'truc',
          items: [],
        },
      ],
    },
    { path: 'a single name', items: [] },
  ]);
});

it('should sort folders before files', () => {
  expect(
    buildNestedTree([
      {
        path: 'def',
      },
      {
        path: 'path/where',
      },
      {
        path: 'path/to',
      },
      {
        path: 'abc',
      },
    ])
  ).toEqual([
    {
      path: 'path',
      items: [
        {
          path: 'to',
          items: [],
        },
        {
          path: 'where',
          items: [],
        },
      ],
    },
    {
      path: 'abc',
      items: [],
    },
    {
      path: 'def',
      items: [],
    },
  ]);
});
