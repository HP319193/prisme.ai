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
    { path: 'a single name', items: [] },
    {
      path: 'folder',
      items: [
        {
          path: 'truc',
          items: [],
        },
        {
          path: 'chose',
          items: [
            {
              path: 'truc',
              items: [],
            },
          ],
        },
      ],
    },
  ]);
});
