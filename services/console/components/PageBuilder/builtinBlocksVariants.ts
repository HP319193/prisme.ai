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
    name: {
      fr: 'Cartes à Blocks',
      en: 'Blocks cards',
    },
    slug: 'Cards_Blocks',
    block: 'Cards',
    photo: '/images/blocks/preview-Cards-blocks.png',
    config: {
      variant: 'blocks',
    },
  },
  {
    name: {
      fr: 'Boutons avec étiquette',
      en: 'Buttons with tag',
    },
    slug: 'Buttons_tag',
    block: 'Buttons',
    photo: '/images/blocks/preview-Buttons-tag.png',
    config: {
      buttons: [
        {
          text: 'New notifications',
          variant: 'default',
          tag: '5',
        },
        {
          text: 'Archived',
          variant: 'default',
          unselected: true,
          tag: '25',
        },
        {
          text: 'Starred',
          variant: 'default',
          unselected: true,
          tag: '12',
        },
      ],
    },
  },
  {
    name: {
      fr: 'Formulaire de contact',
      en: 'Contact Form',
    },
    slug: 'Form_Contact',
    block: 'Form',
    description: {
      fr: 'Un formulaire de contact avec email et message',
      en: 'A contact form with email and message',
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
  {
    name: {
      fr: 'Mise en page en colonnes',
      en: 'Columns layout',
    },
    slug: 'BlocksList_columns',
    block: 'BlocksList',
    description: {
      fr: 'Une mise en page commune avec entête, pied de page et trois colonnes',
      en: 'A common layout with header, footer and three columns.',
    },
    photo: '/images/blocks/preview-BlocksList_columns.png',
    config: {
      blocks: [
        {
          slug: 'BlocksList',
          blocks: [
            {
              slug: 'Header',
              title: 'Title',
            },
          ],
        },
        {
          slug: 'BlocksList',
          blocks: [
            {
              slug: 'BlocksList',
              blocks: [
                {
                  slug: 'RichText',
                  content: 'Left Sidebar',
                },
              ],
            },
            {
              slug: 'BlocksList',
              blocks: [
                {
                  slug: 'RichText',
                  content: 'Main content',
                },
              ],
            },
            {
              slug: 'BlocksList',
              blocks: [
                {
                  slug: 'RichText',
                  content: 'Right Sidebar',
                },
              ],
            },
          ],
          css: `:block {
              display: flex;
              flex-direction: row
            }
`,
        },
        {
          slug: 'Footer',
          content: {
            blocks: [
              {
                slug: 'RichText',
                content: '<p>Footer<p>',
              },
            ],
          },
        },
      ],
      css: `:block {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        :block:nth-child(2) {
          flex: 1;
        }
      `,
    },
  },
  {
    name: {
      fr: 'Mise en page en grille',
      en: 'Grid Layout',
    },
    slug: 'BlocksGrid_analytics',
    block: 'BlocksGrid',
    description: {
      fr: 'Une grille personalisable de contenu analytics',
      en: 'A draggable grid with analytics content',
    },
    photo: '/images/blocks/preview-BlocksGrid_analytics.png',
    config: {
      blocks: [
        {
          block: {
            slug: 'RichText',
            content: `<div style="display:flex;align-items:center">
                  <div style="box-shadow: 0px 7px 14px -6px rgba(0,0,0,0.1);border-radius:1rem;padding:2rem;margin: 1rem;display:flex;flex-direction:column;">
                    <div style="font-size:2rem">30</div>
                    <div>Total users</div>
                  </div>
                </div>`,
          },
          layout: {
            isResizable: false,
            x: 0,
            y: 0,
            h: 1,
            w: 3,
          },
        },
        {
          block: {
            slug: 'RichText',
            content: `<div style="display:flex;align-items:center">
                  <div style="box-shadow: 0px 7px 14px -6px rgba(0,0,0,0.1);border-radius:1rem;padding:2rem;margin: 1rem;display:flex;flex-direction:column;">
                    <div style="font-size:2rem">50</div>
                    <div>Total conversations</div>
                  </div>
                </div>`,
          },
          layout: {
            isResizable: false,
            x: 4,
            y: 0,
            h: 1,
            w: 3,
          },
        },
      ],
    },
  },
];

export default builtinBlocksVariants;
