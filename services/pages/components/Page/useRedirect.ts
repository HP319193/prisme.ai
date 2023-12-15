import { useRouter } from 'next/router';
import { useCallback } from 'react';

interface RedirectGetAttributes {
  url?: string;
  redirect?: {
    url?: string;
    method?: string;
    body?: Record<string, any>;
    locale?: string;
    push?: string;
  };
}

export function useRedirect() {
  const { push, asPath } = useRouter();
  return useCallback(
    ({ url, redirect }: RedirectGetAttributes) => {
      function redirectGet(url: string, locale?: string) {
        if (url.match(/^#/)) {
          window.location.hash = url;
          return;
        }
        if (url.match(/^http/)) {
          window.location.href = url;
          return;
        }
        push(url, undefined, { locale });
      }
      function redirectPost(url: string, body: Record<string, string>) {
        const form = document.createElement('form');
        form.setAttribute('action', url);
        form.setAttribute('method', 'post');
        Object.entries(body).forEach(([k, v]) => {
          const field = document.createElement('input');
          field.setAttribute('type', 'hidden');
          field.setAttribute('name', k);
          field.setAttribute('value', v);
          form.appendChild(field);
        });
        document.body.appendChild(form);
        form.submit();
      }

      if (redirect) {
        const {
          url = asPath,
          method = 'get',
          body = {},
          locale,
          push,
        } = redirect;
        if (push) {
          return window.history.pushState({}, '', url);
        }
        if (`${method}`.toLowerCase() === 'get') {
          return redirectGet(url, locale);
        }
        return redirectPost(url, body);
      }
      if (url) {
        redirectGet(url);
      }
    },
    [asPath, push]
  );
}
