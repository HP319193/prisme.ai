import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

import { Action, ActionConfig, ActionProps } from './Action';
import { BaseBlockConfig } from './types';
import { BaseBlock } from './BaseBlock';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useLocalizedText from '../useLocalizedText';
import { BlocksListConfig, BlocksList } from './BlocksList';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';

interface HeaderConfig extends BaseBlockConfig {
  title?: Prismeai.LocalizedText;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  logo?: {
    src: string;
    alt: string;
    action?: Omit<ActionConfig, 'text'>;
  };
  nav: (ActionConfig | BlocksListConfig)[];
  fixed?: boolean;
}

interface HeaderProps
  extends HeaderConfig,
    Pick<ActionProps, 'Link' | 'events'> {}

const isAction = (
  item: ActionConfig | BlocksListConfig
): item is ActionConfig => {
  return !(item as BlocksListConfig).blocks;
};

interface MenuItemProps extends Pick<ActionProps, 'Link' | 'events'> {
  item: HeaderConfig['nav'][number];
}
const MenuItem = ({ item, events, Link }: MenuItemProps) => {
  if (isAction(item)) {
    return <Action {...item} events={events} Link={Link} />;
  }
  return <BlocksList {...item} />;
};

export const Header = ({
  Link,
  events,
  className,
  level = 1,
  fixed,
  ...config
}: HeaderProps) => {
  const { localize } = useLocalizedText();
  const [visible, setVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const nav = config.nav && Array.isArray(config.nav) ? config.nav : [];

  useEffect(() => {
    const listener = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', listener);
    return () => {
      window.removeEventListener('scroll', listener);
    };
  });

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

  const H = `h${level}` as keyof JSX.IntrinsicElements;
  const title = localize(config.title);

  const toggle = useCallback(() => {
    setVisible((visible) => !visible);
  }, []);

  return (
    <div
      className={`pr-block-header ${className} ${
        fixed ? 'pr-block-header--fixed' : ''
      } ${hasScrolled ? 'pr-block-header--has-scrolled' : ''}`}
    >
      <div className="pr-block-header__container">
        <div className="pr-block-header__left">
          {logo && (
            <div className="pr-block-header__logo">
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
          {title && <H className="pr-block-header__title">{title}</H>}
        </div>
        <div className="pr-block-header__right">
          <button className="pr-block__menu-toggle" onClick={toggle}>
            <MenuOutlined />
          </button>
          <div
            className={`pr-block__menu ${
              visible ? 'pr-block__menu--visible' : 'pr-block__menu--hidden'
            }`}
          >
            {nav.map((item, k) => (
              <div key={k} className="pr-block__menu-item">
                <MenuItem item={item} events={events} Link={Link} />
              </div>
            ))}
            <button
              className="pr-block__menu-toggle pr-block__menu-toggle--close"
              onClick={toggle}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultStyles = `:block {
  min-height: 4rem;
  --pr-header-color: var(--color-accent, rgba(0,0,0,.8));
  --pr-header-contrast: var(--color-accent-contrast, white);
  --pr-header-logo-height: 3rem;
}
.pr-block-header__container {
  display: flex;
  flex: 1 1 0%;
  justify-content: space-between;
  position: relative;
  background-color: var(--pr-header-contrast);
}
:block.pr-block-header--fixed .pr-block-header__container {
  position: fixed;
  left: 0;
  right: 0;
  transition: background-color .2s ease-in;
}
:block.pr-block-header--fixed.pr-block-header--has-scrolled .pr-block-header__container {
  background-color: var(--pr-header-color);
}
:block.pr-block-header--fixed.pr-block-header--has-scrolled .pr-block-header__container *:not(svg, path) {
  color: var(--pr-header-contrast);
}

@media (min-width:768px) {
  :block {
    align-items: center;
  }
}

.pr-block-header__left {
  display: flex;
  margin: 1rem;
  z-index: 1;
}

.pr-block-header__logo,
.pr-block-header__logo a {
  display: flex;
  justify-content: center;
}
.pr-block-header__logo {
  margin-right: 1rem;
  height: var(--pr-header-logo-height, 3rem);
}

.pr-block-header__logo-image {
  height: 100%;
}

.pr-block-header__title {
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 700;
}

.pr-block-header__right {
  display: flex;
  justify-content: flex-end;
  color: var(--color-text);
  background-color: transparent;
}
.pr-block__menu {
  display: flex;
  flex-direction: row;
}
.pr-block__menu-toggle {
  display: none;
}
.pr-block__menu-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
}
@media (max-width: 414px) {
  :block {
    height: 4rem;
  }
  .pr-block__menu {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--pr-header-color);
    transition: transform .2s ease-in;
    transform: translate3d(0, -100%, 0);
    padding-top: 6rem;
    height: 100vh;
    flex-direction: column;
    color: var(----pr-header-contrast);
    padding: 10rem 2rem 0 2rem;
  }
  .pr-block-header__container *:not(svg, path) {
    color: var(--pr-header-contrast);
  }
  .pr-block__menu--visible {
    transform: translate3d(0, 0, 0);
  }
  .pr-block__menu-toggle {
    display: flex;
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.8rem;
  }
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
