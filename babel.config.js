module.exports = {
  overrides: [
    {
      test: [
        './services/console',
        './services/pages',
        './__mocks__',
        './packages/blocks',
        './packages/design-system',
      ],
      presets: [['@babel/preset-react', { runtime: 'automatic' }]],
    },
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};
