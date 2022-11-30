import Link from 'next/link';
import { AnchorHTMLAttributes, HTMLAttributes, HTMLProps } from 'react';

export const LinkInTrans = ({
  href = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <Link href={href}>
    <a {...props}>{children}</a>
  </Link>
);

export default LinkInTrans;
