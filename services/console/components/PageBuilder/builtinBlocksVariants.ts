export const builtinBlocksVariants = [
  {
    name: {
      fr: 'Cartes style court',
      en: 'Cards Short',
    },
    slug: 'Cards_Short',
    block: 'Cards',
    photo: '/images/blocks/preview-Cards-short.png',
    config: {
      variant: 'short',
    },
  },
  {
    name: {
      fr: 'Cartes style article',
      en: 'Cards Article',
    },
    slug: 'Cards_Article',
    block: 'Cards',
    photo: '/images/blocks/preview-Cards-articles.png',
    config: {
      variant: 'article',
    },
  },
  {
    name: {
      fr: 'Cartes style carré',
      en: 'Cards Square',
    },
    slug: 'Cards_Square',
    block: 'Cards',
    photo: '/images/blocks/preview-Cards-square.png',
    config: {
      variant: 'square',
    },
  },
  {
    name: {
      fr: "Cartes d'actions",
      en: 'Actions cards',
    },
    slug: 'Cards_Action',
    block: 'Cards',
    photo: '/images/blocks/preview-Cards-actions.png',
    config: {
      variant: 'actions',
    },
  },
  {
    name: 'Contact Form',
    slug: 'Form_Contact',
    block: 'Form',
    description: 'Un form de contact avec email et message',
    photo: '/images/blocks/preview.jpg',
    config: {
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
          },
          message: {
            type: 'string',
            'ui:widget': 'textarea',
          },
        },
      },
    },
  },
];

export default builtinBlocksVariants;
