import i18n from 'i18next';
import common from '../services/console/public/locales/fr/common.json';
import workspaces from '../services/console/public/locales/fr/workspaces.json';
import errors from '../services/console/public/locales/fr/errors.json';
import pages from '../services/console/public/locales/fr/pages.json';
import sign from '../services/console/public/locales/fr/sign.json';
import user from '../services/console/public/locales/fr/user.json';

i18n.init({
  lng: 'fr', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    fr: {
      common,
      workspaces,
      errors,
      pages,
      sign,
      user,
    },
  },
});
const ts = {
  common: i18n.getFixedT('fr', 'common'),
  workspaces: i18n.getFixedT('fr', 'workspaces'),
  errors: i18n.getFixedT('fr', 'errors'),
  pages: i18n.getFixedT('fr', 'pages'),
  sign: i18n.getFixedT('fr', 'sign'),
  user: i18n.getFixedT('fr', 'user'),
};

export const useTranslation = (namespace) => {
  return { t: ts[namespace] || i18n.t, i18n };
};
