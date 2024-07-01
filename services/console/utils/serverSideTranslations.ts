import { merge } from 'lodash';
import { serverSideTranslations as originalServerSideTranslations } from 'next-i18next/serverSideTranslations';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { TRANSLATIONS_OVERRIDE = '' },
} = getConfig();

let promise: Promise<any> | undefined;
let isNotFound: true | undefined;

export const serverSideTranslations: typeof originalServerSideTranslations =
  async (initialLocale, namespacesRequired, configOverride, extraLocales) => {
    if (promise && process?.env?.NODE_ENV !== 'development') return promise;
    promise = new Promise(async (resolve) => {
      const translations = await originalServerSideTranslations(
        initialLocale,
        namespacesRequired,
        configOverride,
        extraLocales
      );

      /**
       * It will not retry loading translations if a 404 has been returned in last 60s
       * Then, the response will be kept in cache for 60s
       */
      if (!isNotFound && TRANSLATIONS_OVERRIDE) {
        try {
          const response = await fetch(TRANSLATIONS_OVERRIDE);
          if (response.status === 404) {
            isNotFound = true;
            resolve(translations);
            return;
          }
          const override = await response.json();
          translations._nextI18Next.initialI18nStore = merge(
            translations._nextI18Next.initialI18nStore,
            override
          );
        } catch (e) {
          console.error('TRANSLATIONS_OVERRIDE is invalid', e);
        }
      }
      setTimeout(() => {
        promise = undefined;
        isNotFound = undefined;
      }, 60 * 1000);
      resolve(translations);
    });
    return promise;
  };
