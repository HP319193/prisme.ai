import { Tooltip } from 'antd';
import {
  cloneElement,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';
import { isBlock, isRenderProp, isString } from '../utils/getContentType';
import { useProductLayoutContext } from './Provider';
import { Icons, ProductLayoutProps, SidebarHeaderProps } from './types';
import { useBlocks } from '../../Provider/blocksContext';
import { useBlock } from '../../Provider';
import IconBack from './IconBack';
import IconExpand from './IconExpand';
import IconGear from './IconGear';
import IconShare from './IconShare';
import IconHome from './IconHome';
import IconCharts from './IconCharts';
import useLocalizedText from '../../useLocalizedText';
import { isLocalizedObject } from '@prisme.ai/design-system';
import GenericBlock from '../utils/GenericBlock';
import hash from 'hash-sum';

const DefaultLogo = ({ title }: { title: string }) => {
  const color = useMemo(() => `#${hash(title).substring(0, 6)}`, [title]);
  return (
    <div
      className="product-layout-sidebar__logo product-layout-sidebar__logo--default"
      style={{ backgroundColor: color }}
    >
      {title.substring(0, 1).toUpperCase()}
    </div>
  );
};

const LinkOrNot = ({
  children,
  href,
  className,
  onClick,
  ifNot,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: HTMLAttributes<HTMLButtonElement>['onClick'];
  ifNot?: ReactElement;
}) => {
  const {
    components: { Link },
  } = useBlocks();
  if (onClick) {
    return (
      <button onClick={onClick} type="button">
        {children}
      </button>
    );
  }
  if (href)
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  if (ifNot)
    return cloneElement(ifNot, {
      children,
    });
  return <>{children}</>;
};

function getIcon(name: Icons) {
  switch (name) {
    case 'gear':
      return <IconGear />;
    case 'share':
      return <IconShare />;
    case 'home':
      return <IconHome />;
    case 'charts':
      return <IconCharts />;
    default:
      if (name.match(/^<svg/)) {
        return (
          <span
            className="icon-svg"
            dangerouslySetInnerHTML={{ __html: name }}
          />
        );
      }
      return <img src={name} />;
  }
}

export const SidebarHeader = ({
  title,
  tooltip,
  logo,
  href,
  back,
  buttons,
}: SidebarHeaderProps) => {
  const { sidebarOpen, toggleSidebar } = useProductLayoutContext();
  const { events } = useBlock();
  const { localize } = useLocalizedText();

  const renderButtons = useMemo(() => {
    if (isRenderProp(buttons)) {
      return buttons;
    }
    if (isBlock(buttons)) {
      return <GenericBlock content={buttons} />;
    }
    return buttons?.map(({ icon, type, value, payload, className }, key) => {
      if (!icon) return null;
      return (
        <LinkOrNot
          key={key}
          href={['internal', 'external'].includes(type) ? value : undefined}
          className={`product-layout-sidebar__header-link product-layout-sidebar__header-link--button ${
            className || ''
          }`}
          ifNot={<span className={className}></span>}
        >
          <button
            type="button"
            className="product-layout-sidebar__header-button"
            onClick={() => {
              if (type === 'script') {
                try {
                  new Function(value)();
                } catch (e) {
                  console.error(e);
                }
              }
              if (type === 'event') {
                events?.emit(value, payload);
              }
            }}
          >
            {getIcon(icon)}
          </button>
        </LinkOrNot>
      );
    });
  }, [buttons]);

  return (
    <div
      className={`product-layout-sidebar__header ${
        back ? 'product-layout-sidebar__header--has-back' : ''
      }`}
    >
      <LinkOrNot
        href={href}
        className="product-layout-sidebar__header-link"
        onClick={back ? () => toggleSidebar() : undefined}
      >
        <Tooltip
          title={sidebarOpen ? undefined : localize(tooltip)}
          placement="right"
        >
          <div className="product-layout-sidebar__logo">
            {logo && (
              <GenericBlock
                content={logo}
                ifString={({ content, ...props }) => (
                  <img src={content} {...props} />
                )}
              />
            )}
            {!logo && (
              <DefaultLogo title={typeof title === 'string' ? title : ''} />
            )}
          </div>
        </Tooltip>
      </LinkOrNot>
      {back && (
        <LinkOrNot href={back} className="product-layout-sidebar__header-link">
          <div className="product-layout-sidebar__logo">
            <IconBack height={20} width={20} />
          </div>
        </LinkOrNot>
      )}
      {title && (
        <GenericBlock
          content={title}
          className="product-layout-sidebar__title"
          ifString={({ content, ...props }) => (
            <Tooltip title={localize(tooltip)} placement="bottom">
              <div {...props}>
                <span>{content}</span>
              </div>
            </Tooltip>
          )}
        />
      )}
      {renderButtons}
    </div>
  );
};

const SidebarItems = ({
  items,
}: {
  items: NonNullable<ProductLayoutProps['sidebar']>['items'];
}) => {
  const { events } = useBlock();
  const { localize } = useLocalizedText();
  if (!items) return null;
  if (isRenderProp(items)) {
    return items;
  }
  if (isBlock(items)) {
    return (
      <GenericBlock content={items} className="product-layout-sidebar__items" />
    );
  }
  if (isString(items)) return <>{items}</>;
  const buttons = useMemo(
    () =>
      items.map(({ text, icon, type, value, payload, selected }) => {
        if (!icon) return null;
        return (
          <LinkOrNot
            href={['internal', 'external'].includes(type) ? value : undefined}
            className="product-layout-sidebar__item-link"
            key={`${text}${icon}${type}${value}`}
          >
            <button
              className={`product-layout-sidebar__item ${
                selected ? 'product-layout-sidebar__item--selected' : ''
              }`}
              type="button"
              onClick={() => {
                if (type === 'script') {
                  try {
                    new Function(value)();
                  } catch (e) {
                    console.error(e);
                  }
                }
                if (type === 'event') {
                  events?.emit(value, payload);
                }
              }}
            >
              <div className="product-layout-sidebar__item-button">
                <span className="product-layout-sidebar__item-icon">
                  {getIcon(icon)}
                </span>
                <span className="product-layout-sidebar__item-label product-layout-sidebar__item-label">
                  {isLocalizedObject(text) && localize(text)}
                  {isRenderProp(text) && text}
                  {isBlock(text) && <GenericBlock content={text} />}
                </span>
              </div>
              <div className="product-layout-sidebar__item-label">
                {isLocalizedObject(text) && localize(text)}
                {isRenderProp(text) && text}
                {isBlock(text) && <GenericBlock content={text} />}
              </div>
            </button>
          </LinkOrNot>
        );
      }),
    []
  );
  return <div className="product-layout-sidebar__items">{buttons}</div>;
};

const locales = {
  expand: {
    fr: 'Développer',
    en: 'Expand',
  },
  collapse: {
    fr: 'Réduire',
    en: 'Collapse',
  },
};

export const Sidebar = ({
  header,
  items,
}: ProductLayoutProps['sidebar'] = {}) => {
  const { sidebarOpen, toggleSidebar } = useProductLayoutContext();
  const { localize } = useLocalizedText();
  return (
    <div
      className={`product-layout-sidebar ${
        sidebarOpen ? 'product-layout-sidebar--open' : ''
      }`}
    >
      {isRenderProp(header) ? header : <SidebarHeader {...header} />}

      <SidebarItems items={items} />
      <div className="product-layout-sidebar__toggle">
        <Tooltip
          title={localize(sidebarOpen ? locales.collapse : locales.expand)}
          placement="right"
        >
          <button onClick={() => toggleSidebar()} type="button">
            <IconExpand />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;
