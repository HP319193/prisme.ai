import { Menu } from '@prisme.ai/design-system';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

import { Action, ActionConfig, ActionProps } from './Action';
import { BaseBlockConfig } from './types';
import { BaseBlock } from './BaseBlock';
import { useMemo } from 'react';
import useLocalizedText from '../useLocalizedText';

interface HeaderConfig extends BaseBlockConfig {
  title?: Prismeai.LocalizedText;
  logo?: {
    src: string;
    alt: string;
    action?: Omit<ActionConfig, 'text'>;
  };
  nav: ActionConfig[];
}

interface HeaderProps
  extends HeaderConfig,
    Pick<ActionProps, 'Link' | 'events'> {}

export const Header = ({ Link, events, className, ...config }: HeaderProps) => {
  const { localize } = useLocalizedText();
  const nav = config.nav && Array.isArray(config.nav) ? config.nav : [];

  const logo = useMemo(
    () =>
      config.logo ? (
        <img
          src={config.logo.src}
          alt={config.logo.alt}
          className="pr-block-header__logo-image"
        />
      ) : null,
    [config.logo]
  );

  return (
    <div className={`pr-block-header ${className}            block-header`}>
      <div className="pr-block-header__left          block-header__left">
        {logo && (
          <div className="pr-block-header__logo              left__logo logo">
            {config.logo?.action && (
              <Action
                {...config.logo.action}
                text={logo}
                Link={Link}
                events={events}
              />
            )}
            {!config.logo?.action && logo}
          </div>
        )}
        <h1 className="pr-block-header__title           left__title">
          {localize(config.title)}
        </h1>
      </div>
      <Menu
        items={nav.map((props, k) => ({
          label: (
            <Action
              type={props.type}
              value={props.value}
              payload={props.payload}
              text={props.text}
              Link={Link}
              events={events}
            />
          ),
          key: `${k}`,
        }))}
        onClick={(e) => {}}
        className="pr-block-header_right"
      />
    </div>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex: 1 1 0%;
  justify-content: space-between;
}

@media (min-width:768px) {
  :block {
    align-items: center;
  }
}

.pr-block-header__left {
  display: flex;
  min-width: 6.25rem;
}

.pr-block-header__logo,
.pr-block-header__logo a {
  display: flex;
  justify-content: center;
}
.pr-block-header__logo {
  margin-right: 1rem;
}

.pr-block-header__logo-image {
  max-height: 3rem;
}

.pr-block-header__title {
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 700;
}

.pr-block-header_right {
  width: 65%;
  justify-content: flex-end;
  color: var(--color-text);
  background-color: transparent;
}
`;

export const HeaderInContext = () => {
  const { config, events } = useBlock<HeaderConfig>();
  const {
    components: { Link },
  } = useBlocks();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Header {...config} Link={Link} events={events} />
    </BaseBlock>
  );
};

HeaderInContext.styles = defaultStyles;

export default HeaderInContext;
