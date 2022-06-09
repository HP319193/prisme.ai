import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Component, JSXElementConstructor, ReactElement } from 'react';

const i18n = createInstance({
  resources: {
    en: {
      translation: {
        cards: {
          next: 'Next',
          prev: 'Previous',
        },
        form: {
          submit: 'Submit',
        },
        datatable: {
          empty: 'No data',
          asc: 'Sort ascending',
          desc: 'Sort descending',
          nosort: 'Cancel sort',
        },
      },
    },
    fr: {
      translation: {
        cards: {
          next: 'Suivant',
          prev: 'Précédent',
        },
        form: {
          submit: 'Envoyer',
        },
        datatable: {
          empty: 'Aucune donnée',
          asc: 'Trier par ordre ascendant',
          desc: 'Trier par ordre descendant',
          nosort: 'Ne plus trier',
        },
      },
    },
    es: {
      cards: {
        next: 'Siguiente',
        prev: 'Anteriormente',
      },
      translation: {
        form: {
          submit: 'Enviar',
        },
        datatable: {
          empty: 'No hay datos',
          asc: 'Ordenar en forma ascendente',
          desc: 'Clasificar en orden descendente',
          nosort: 'Ya no se clasifica',
        },
      },
    },
  },
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});

i18n.use(initReactI18next).init();

type i18nHOC<T> = (
  Component: JSXElementConstructor<T>
) => (props: T) => ReactElement<T>;

export const withI18nProvider: i18nHOC<{ edit: boolean }> = (Component) => {
  return (props) => (
    <I18nextProvider i18n={i18n}>
      <Component {...props} />
    </I18nextProvider>
  );
};

export default i18n;
