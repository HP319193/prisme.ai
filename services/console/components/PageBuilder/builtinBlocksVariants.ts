export const builtinBlocksVariants = [
  {
    name: {
      fr: 'Cartes style court',
      en: 'Cards Short',
      es: 'Cartas cortas',
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
      es: 'Artículo cartas',
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
      es: 'Cuadrado cartas',
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
      es: 'Acción cartas',
    },
    slug: 'Cards_Action',
    block: 'Cards',
    photo: '/images/blocks/preview-Cards-actions.png',
    config: {
      variant: 'actions',
    },
  },
  {
    name: {
      fr: 'Formulaire de contact',
      en: 'Contact Form',
      es: 'Formulario de contacto',
    },
    slug: 'Form_Contact',
    block: 'Form',
    description: {
      fr: 'Un formulaire de contact avec email et message',
      en: 'A contact form with email and message',
      es: 'Un formulario de contacto con correo electrónico y mensaje',
    },
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
