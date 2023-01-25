import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { BlocksDependenciesContext } from '../Provider/blocksContext';
import { useEffect, useState } from 'react';

export interface BreadcrumbsConfig extends BaseBlockConfig {
  links: {
    href: string;
    label: string;
  }[];
}
export interface BreadcrumbsProps extends BreadcrumbsConfig {
  Link: BlocksDependenciesContext['components']['Link'];
}

export const Breadcrumbs = ({
  className = '',
  links,
  Link,
}: BreadcrumbsProps) => {
  const last = (links || []).length - 1;
  return (
    <nav
      className={`pr-block-breadcrumbs ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="pr-block-breadcrumbs__list" role="list">
        {(links || []).map(({ href, label }, key) => (
          <li
            key={key}
            className={`pr-block-breadcrumbs__link ${
              key === last ? 'pr-block-breadcrumbs__link--current' : ''
            }`}
          >
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const defaultStyles = `:block .pr-block-breadcrumbs__list {
  display: flex;
  flex-direction: row;
}

:block .pr-block-breadcrumbs__link {
  display: flex;
}

:block .pr-block-breadcrumbs__link--current a {
  font-weight: bold;
}

:block .pr-block-breadcrumbs__link:not(:last-child):after {
  content: '>';
  display: flex;
  margin: 0 1rem;
}`;

export const BreadcrumbsInContext = () => {
  const { config } = useBlock<BreadcrumbsConfig>();
  const {
    components: { Link },
  } = useBlocks();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Breadcrumbs {...config} Link={Link} />
    </BaseBlock>
  );
};
BreadcrumbsInContext.styles = defaultStyles;

export default BreadcrumbsInContext;
