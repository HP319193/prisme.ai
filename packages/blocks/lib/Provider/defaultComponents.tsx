import { Loading as DSLoading } from '@prisme.ai/design-system';
import React from 'react';
import { tw } from 'twind';

export const Link = ({ href, props }: { href: string } & any) => (
  <a href={href} {...props} />
);
export const Loading = () => (
  <DSLoading className={tw`bg-white absolute top-0 right-0 bottom-0 left-0`} />
);
