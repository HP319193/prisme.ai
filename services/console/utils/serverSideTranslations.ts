import { merge } from 'lodash';
import { serverSideTranslations as originalServerSideTranslations } from 'next-i18next/serverSideTranslations';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { TRANSLATIONS_OVERRIDE = '' },
} = getConfig();

let promise: Promise<any> | undefined;

function fetchOverrideTranslations() {
  promise =
    promise && process?.env?.NODE_ENV !== 'development'
      ? promise
      : new Promise(async (resolve) => {
          /**
           * It will not retry loading translations if a 404 has been returned in last 60s
           * Then, the response will be kept in cache for 60s
           */
          if (TRANSLATIONS_OVERRIDE) {
            try {
              const response = await fetch(TRANSLATIONS_OVERRIDE);
              if (response.status !== 200) {
                resolve({});
                return;
              }
              const override = await response.json();
              resolve(override);
            } catch (e) {
              console.error('TRANSLATIONS_OVERRIDE is invalid', e);
              resolve({});
            }
          } else {
            resolve({});
          }
          setTimeout(() => {
            promise = undefined;
          }, 60 * 1000);
        });
  return promise;
}

export const serverSideTranslations: typeof originalServerSideTranslations =
  async (initialLocale, namespacesRequired, configOverride, extraLocales) => {
    const translations = await originalServerSideTranslations(
      initialLocale,
      namespacesRequired,
      configOverride,
      extraLocales
    );
    const override = await fetchOverrideTranslations();
    translations._nextI18Next.initialI18nStore = merge(
      translations._nextI18Next.initialI18nStore,
      override
    );
    return translations;
  };
