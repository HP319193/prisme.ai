const _401 = {
  slug: '_401',
  name: {
    fr: 'Accès restreint (401)',
    en: 'Restricted access (401)',
  },
  appInstances: [],
  blocks: [
    {
      slug: 'RichText',
      'template.if': '!{{SYSTEM.userIsSignedIn}}',
      content: {
        fr: 'Cette page nécessite une authentification',
        en: 'This page requires authentication',
      },
      css: ':block {\n  font-size: 1.8rem;\n  font-weight: 600;\n}',
    },
    {
      slug: 'RichText',
      'template.if': '{{SYSTEM.userIsSignedIn}}',
      content: {
        fr: "Vous n'avez pas l'autorisation d'accéder à cette page.",
        en: 'You are not authorized to access this page.',
      },
      css: ':block {\n  font-size: 1.8rem;\n  font-weight: 600;\n}',
    },
    {
      slug: 'Signin',
      'template.if': '!{{SYSTEM.userIsSignedIn}}',
      label: {
        fr: 'Me connecter',
        en: 'Signin',
      },
      css: '@import default;\n:block {\n  font-weight: 600;\n  font-size: 1.4rem;\n}',
    },
    {
      slug: 'Signin',
      'template.if': '{{SYSTEM.userIsSignedIn}}',
      label: {
        fr: 'Me connecter avec un autre compte',
        en: 'Signin with another account',
      },
      css: '@import default;\n:block {\n  font-weight: 600;\n  font-size: 1.4rem;\n}',
    },
  ],
  styles:
    '\nbody {\n  --color-accent: #015dff;\n  --color-accent-light: #80A4FF;\n  --color-accent-dark: #052e84;\n  --color-accent-darker: #03133a;\n  --color-accent-contrast: white;\n  --color-background: white;\n  --color-text: black;\n  --color-border: black;\n  --color-background-transparent: rgba(0,0,0,0.05);\n  --color-input-background: white;\n  background-color: var(--color-background);\n}\n.page-blocks {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.page-blocks > .pr-block-blocks-list {\n  display: flex;\n  flex-direction: column;\n}\n\n.pr-poweredby {\n  position: fixed;\n  left: 1rem;\n  bottom: 1rem;\n}\n',
};

export default _401;
