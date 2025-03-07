import { I18n } from 'next-i18next';

export const addFormatters = (i18n: I18n) => {
  if (!i18n.services || !i18n.services.formatter) return;
  i18n.services.formatter.add('do', (value, lng, { display = '' }) =>
    value ? display : ''
  );
};

export default addFormatters;
