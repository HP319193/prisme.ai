import { HTMLAttributes, ReactElement, useCallback, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

export const Link = ({
  href,
  children,
  ...props
}: {
  href: string;
  children: ReactElement;
} & HTMLAttributes<HTMLAnchorElement>) => {
  const { asPath } = useRouter();

  let fullHref = href;
  try {
    const { origin } = window.location;
    if (origin === new URL(href).origin) {
      fullHref = href.replace(origin, '');
    }
  } catch {}

  fullHref = `${!href || href.match(/^\?/) ? asPath.replace(/\?.*$/, '') : ''}${
    href || ''
  }`;

  const [, lang, url] = fullHref.match(/^\/?(\w{2})\/(.*$)/) || [, , fullHref];

  const { class: _className, className = _className, ...aProps } = props as any;
  return (
    <NextLink href={url} locale={lang}>
      <a
        {...aProps}
        className={className}
        onClick={(e) => {
          props.onClick && props.onClick(e);

          window.parent.postMessage(
            { type: 'pagePreviewNavigation', href },
            '*'
          );
        }}
      >
        {children}
      </a>
    </NextLink>
  );
};

export default Link;
