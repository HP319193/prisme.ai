import { BlockContext, useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { BlocksDependenciesContext } from '../Provider/blocksContext';
import { ActionConfig, Action } from './Action';

export interface BreadcrumbsConfig extends BaseBlockConfig {
  links: ({
    className?: boolean;
  } & ActionConfig)[];
}
export interface BreadcrumbsProps extends BreadcrumbsConfig {
  Link: BlocksDependenciesContext['components']['Link'];
  events: BlockContext['events'];
}

export const Breadcrumbs = ({
  className = '',
  links,
  Link,
  events,
}: BreadcrumbsProps) => {
  const last = (links || []).length - 1;

  return (
    <nav
      className={`pr-block-breadcrumbs ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="pr-block-breadcrumbs__list" role="list">
        {(links || []).map(({ className = '', ...action }, key) => (
          <li
            key={key}
            className={`pr-block-breadcrumbs__item ${className} ${
              key === last ? 'pr-block-breadcrumbs__link--current' : ''
            }`}
          >
            <Action
              {...action}
              events={events}
              Link={Link}
              className="pr-block-breadcrumbs__action"
            />
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

:block .pr-block-breadcrumbs__link--current .pr-block-breadcrumbs__link {
  font-weight: bold;
}

:block .pr-block-breadcrumbs__item:not(:last-child):after {
  content: '>';
  display: flex;
  margin: 0 1rem;
}`;

export const BreadcrumbsInContext = () => {
  const { config, events } = useBlock<BreadcrumbsConfig>();
  const {
    components: { Link },
  } = useBlocks();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Breadcrumbs {...config} Link={Link} events={events} />
    </BaseBlock>
  );
};
BreadcrumbsInContext.styles = defaultStyles;

export default BreadcrumbsInContext;
