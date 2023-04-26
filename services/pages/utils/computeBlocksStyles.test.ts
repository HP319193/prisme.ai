import { computePageStyles } from './computeBlocksStyles';

jest.mock('@prisme.ai/blocks', () => {
  return {
    getBlockStyles: ({ containerClassName }: any) => `.${containerClassName}{}`,
    builtinBlocks: {},
  };
});

let random = Math.random;
let count = 0;
beforeEach(() => {
  Math.random = () => {
    return ++count;
  };
});
afterEach(() => {
  Math.random = random;
});

it('should add cssId on each block', () => {
  expect(
    computePageStyles({
      slug: '',
      appInstances: [],
      apiKey: '',
      blocks: [
        {
          slug: 'BlocksList',
          css: ':block {}',
          content: {
            blocks: [
              {
                slug: 'BlocksList',
                css: ':block {}',
              },
            ],
          },
        },
      ],
    })
  ).toEqual({
    page: {
      slug: '',
      appInstances: [],
      apiKey: '',
      blocks: [
        {
          slug: 'BlocksList',
          css: ':block {}',
          cssId: 20000000,
          content: {
            blocks: [
              {
                slug: 'BlocksList',
                css: ':block {}',
                cssId: 30000000,
              },
            ],
          },
        },
      ],
      cssId: 10000000,
    },
    styles: `.__block-20000000{}
.__block-30000000{}`,
  });
});
