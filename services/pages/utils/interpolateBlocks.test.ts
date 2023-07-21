import interpolateBlocks from './interpolateBlocks';

it('should interpolate values', () => {
  expect(
    interpolateBlocks(
      [
        {
          slug: 'RichText',
          content: '<p>Hello {{world}}</p>',
        },
      ],
      { world: 'World' }
    )
  ).toEqual([
    {
      slug: 'RichText',
      content: '<p>Hello World</p>',
    },
  ]);

  expect(
    interpolateBlocks(
      [
        {
          slug: 'RichText',
          content: '<p>Hello {{world}}</p>',
        },
      ],
      {}
    )
  ).toEqual([
    {
      slug: 'RichText',
      content: '<p>Hello </p>',
    },
  ]);

  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          blocks: [
            {
              slug: 'BlocksList',
              blocks: [
                {
                  slug: 'BlocksList',
                  blocks: [
                    {
                      slug: 'RichText',
                      content: '<p>Hello {{world}}</p>',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      { world: 'World' }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [
        {
          slug: 'BlocksList',
          blocks: [
            {
              slug: 'BlocksList',
              blocks: [
                {
                  slug: 'RichText',
                  content: '<p>Hello World</p>',
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});

it('should apply conditions', () => {
  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          'template.if': 'test',
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello World</p>',
            },
          ],
        },
      ],
      { test: false }
    )
  ).toEqual([]);

  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          'template.if': 'test',
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello World</p>',
            },
          ],
        },
      ],
      { test: true }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [
        {
          slug: 'RichText',
          content: '<p>Hello World</p>',
        },
      ],
    },
  ]);

  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          'template.if': 'test',
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello World</p>',
            },
          ],
        },
      ],
      { test: [] }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [
        {
          slug: 'RichText',
          content: '<p>Hello World</p>',
        },
      ],
    },
  ]);

  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello World</p>',
            },
            {
              slug: 'BlocksList',
              'template.if': 'test',
              blocks: [
                {
                  slug: 'RichText',
                  content: '<p>Hello World</p>',
                },
              ],
            },
            {
              slug: 'RichText',
              content: '<p>Hello World</p>',
            },
          ],
        },
      ],
      { test: false }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [
        {
          slug: 'RichText',
          content: '<p>Hello World</p>',
        },
        {
          slug: 'RichText',
          content: '<p>Hello World</p>',
        },
      ],
    },
  ]);
});

// TODO : reactivate this test when expression package is available
xit('should apply condition with expressions', () => {
  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          'template.if': 'test.length > 0',
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello World</p>',
            },
          ],
        },
      ],
      { test: [] }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [],
    },
  ]);
});

it('should repeat blocks', () => {
  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          'template.repeat': {
            on: 'items',
          },
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello {{world}}</p>',
            },
          ],
        },
      ],
      { items: [] }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [],
    },
  ]);

  expect(
    interpolateBlocks(
      [
        {
          slug: 'BlocksList',
          'template.repeat': {
            on: 'items',
            as: 'world',
          },
          blocks: [
            {
              slug: 'RichText',
              content: '<p>Hello {{world}}</p>',
            },
          ],
        },
      ],
      { items: ['one', 'two', 'three'] }
    )
  ).toEqual([
    {
      slug: 'BlocksList',
      blocks: [
        {
          slug: 'RichText',
          content: '<p>Hello one</p>',
        },
        {
          slug: 'RichText',
          content: '<p>Hello two</p>',
        },
        {
          slug: 'RichText',
          content: '<p>Hello three</p>',
        },
      ],
    },
  ]);
});
