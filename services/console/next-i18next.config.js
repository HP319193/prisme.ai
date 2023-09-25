module.exports = {
  i18n: {
    defaultLocale: 'default',
    locales: ['default', 'en', 'fr', 'es', 'id', 'th', 'vi'],
    supportedLngs: ['en', 'fr', 'id', 'th', 'vi'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
