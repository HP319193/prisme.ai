export const PAGE_TEMPLATES = [
  {
    slug: 'index',
    name: {
      fr: "Page d'accueil",
      en: 'Home page',
    },
  },
  {
    slug: '_401',
    name: {
      fr: 'Accès restreint (401)',
      en: 'Restricted access (401)',
    },
  },
  {
    slug: '_404',
    name: {
      fr: 'Page introuvable (404)',
      en: 'Page not found (404)',
    },
  },
  {
    slug: '_doc',
    name: {
      fr: "Documentation d'App",
      en: 'App documentation',
    },
    blocks: [
      {
        slug: 'RichText',
        content: {
          fr: `<h1>Mon App</h1>
<p class="description">Description de mon App</p><br />`,
          en: `<h1>My App</h1>
<p class="description">My App description</p><br />`,
        },
      },
      {
        slug: 'TabsView',
        tabs: [
          {
            text: {
              fr: 'Documentation',
              en: 'Documentation',
            },
            type: 'event',
            content: {
              blocks: [
                {
                  slug: 'RichText',
                  content: 'Documentation',
                },
              ],
            },
          },
          {
            text: {
              fr: 'Journal des changements',
              en: 'Changelog',
            },
            type: 'event',
            content: {
              blocks: [
                {
                  slug: 'RichText',
                  content: `<div class="section">
  <h2>1.0.0</h2>    
  <div class="text">Published on <date>
  Latest stable release.

* This
* That

</div>`,
                },
              ],
            },
          },
          {
            text: {
              fr: 'API',
              en: 'API',
            },
            type: 'event',
            content: {
              blocks: [
                {
                  slug: 'RichText',
                  content: 'API',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
