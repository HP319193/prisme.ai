module.exports = {
  i18n: {
    defaultLocale: 'default',
    locales: ['default', 'en', 'fr', 'es'],
    localeDetection: true,
    reloadOnPrerender: process.env.NODE_ENV === 'development',
  },
};
