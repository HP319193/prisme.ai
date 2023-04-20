import { HTMLAttributes, ReactElement, useCallback, useState } from 'react';
import NextLink from 'next/link';
import { usePreview } from '../usePreview';
import { useRouter } from 'next/router';

export const Link = ({
  href,
  children,
  ...props
}: { href: string; children: ReactElement } & HTMLAttributes<
  HTMLAnchorElement
>) => {
  const [isPreview, setIsPreview] = useState(false);
  const { asPath } = useRouter();
  const setPreview = useCallback(() => {
    setIsPreview(true);
  }, []);
  usePreview(setPreview);

  const fullHref = `${
    !href || href.match(/^\?/) ? asPath.replace(/\?.*$/, '') : ''
  }${href || ''}`;

  const [, lang, url] = fullHref.match(/^\/?(\w{2})\/(.*$)/) || [, , fullHref];

  return (
    <NextLink href={url} locale={lang}>
      <a
        {...props}
        onClick={(e) => {
          props.onClick && props.onClick(e);
          if (!isPreview) return;

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
