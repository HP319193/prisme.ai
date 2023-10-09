import { getBackTemplateDots, removeTemplateDots } from './templatesInBlocks';

it('should transform template. to _ 1', () => {
  expect(
    removeTemplateDots({
      slug: 'BlocksList',
      'template.if': '{{test}}',
    })
  ).toEqual({
    slug: 'BlocksList',
    template_if: '{{test}}',
  });
});

it('should transform template. to _ 2', () => {
  expect(
    removeTemplateDots({
      slug: 'BlocksList',
      'template.if': '{{test}}',
      blocks: [
        {
          slug: 'BlocksList',
          'template.if': '{{test}}',
        },
      ],
    })
  ).toEqual({
    slug: 'BlocksList',
    template_if: '{{test}}',
    blocks: [
      {
        slug: 'BlocksList',
        template_if: '{{test}}',
      },
    ],
  });
});

it('should transform template. to _ 3', () => {
  expect(
    removeTemplateDots({
      slug: 'BlocksList',
      'template.if': '{{test}}',
      content: {
        blocks: [
          {
            slug: 'BlocksList',
            'template.if': '{{test}}',
          },
        ],
      },
    })
  ).toEqual({
    slug: 'BlocksList',
    template_if: '{{test}}',
    content: {
      blocks: [
        {
          slug: 'BlocksList',
          template_if: '{{test}}',
        },
      ],
    },
  });
});

it('should get back . to template 1', () => {
  expect(
    getBackTemplateDots({
      slug: 'BlocksList',
      template_if: '{{test}}',
      content: {
        blocks: [
          {
            slug: 'BlocksList',
            template_if: '{{test}}',
          },
        ],
      },
    })
  ).toEqual({
    slug: 'BlocksList',
    'template.if': '{{test}}',
    content: {
      blocks: [
        {
          slug: 'BlocksList',
          'template.if': '{{test}}',
        },
      ],
    },
  });
});
