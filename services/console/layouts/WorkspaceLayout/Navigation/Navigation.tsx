import { builtinBlocks } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from '../../../providers/Workspace';
import AutomationIcon from '../../../icons/automation.svgr';
import SearchIcon from '../../../icons/search.svgr';
import PageIcon from '../../../icons/page.svgr';
import BlockIcon from '../../../icons/block.svgr';
import AppIcon from '../../../icons/app.svgr';
import PlusIcon from '../../../icons/plus-rounded.svgr';
import AngleIcon from '../../../icons/angle-down.svgr';
import FolderIcon from '../../../icons/folder.svgr';
import CloseIcon from '../../../icons/close.svgr';
import useLocalizedText from '../../../utils/useLocalizedText';
import { Tooltip } from 'antd';
import Color from 'color';
import { stringToHexaColor } from '../../../utils/strings';
import Add from './Add';
import { useWorkspaceLayout } from '../context';
import { navigationContext } from './context';
import OpenStateProvider, { useOpenState } from './OpenStateProvider';
import RootLinksGroup from './RootLinksGroup';
import Highlight from '../../../components/Highlight';
import Storage from '../../../utils/Storage';

const {
  ProductLayout: { IconHome, IconCharts, useProductLayoutContext },
} = builtinBlocks;

export const Navigation = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { workspace } = useWorkspace();
  const { opened, toggle } = useOpenState();
  const { installApp } = useWorkspaceLayout();
  const { toggleSidebar, sidebarOpen } = useProductLayoutContext();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState(
    Storage.get(`sidebar-search-${workspace.id}`) || ''
  );

  const { asPath } = useRouter();

  useEffect(() => {
    toggleSidebar(
      Storage.get(`sidebarOpen-${workspace.id}`) ? 'open' : 'close'
    );
  }, [toggleSidebar, workspace.id]);

  useEffect(() => {
    Storage.set(`sidebarOpen-${workspace.id}`, sidebarOpen);
  }, [sidebarOpen, workspace.id]);

  useEffect(() => {
    Storage.set(`sidebar-search-${workspace.id}`, searchQuery);
  }, [searchQuery, workspace.id]);

  const add = useCallback(
    (type: string) => () => {
      if (type !== 'app') return;
      installApp();
    },
    [installApp]
  );

  const navigations = useMemo(() => {
    function processItems({
      type,
      slug,
      name,
      icon,
      tooltip = slug,
    }: {
      type: string;
      slug: string;
      name: Prismeai.LocalizedText | string;
      icon?: string;
      tooltip?: string;
    }) {
      function getIcon() {
        switch (type) {
          case 'automation':
            return AutomationIcon;
          case 'page':
            return PageIcon;
          case 'block':
            return BlockIcon;
          case 'app':
            return AppIcon;
          default:
            return 'span';
        }
      }
      const color = `#${stringToHexaColor(localize(name))}`;
      const backgroundColor = new Color(color).fade(0.8).toString();
      const Icon = getIcon();
      const href = `/workspaces/${workspace.id}/${type}s/${slug}`;
      const item = {
        type,
        icon: (
          <div
            className="flex p-[4px] rounded-[3px] justify-center"
            style={{ color, backgroundColor }}
          >
            {icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} height={15} width={15} alt="" />
            ) : (
              <Icon height={15} color={color} />
            )}
          </div>
        ),
        label: `${localize(name)}`,
        href,
        tooltip: (
          <>
            <div className="font-bold">{localize(name)}</div>
            <div className="italic">
              <Highlight
                highlight={searchQuery}
                component={<span className="text-[#ecfd18] font-bold" />}
              >
                {tooltip}
              </Highlight>
            </div>
          </>
        ),
        active: decodeURIComponent(asPath) === href,
      };

      return item;
    }

    function generateNesting(items: ReturnType<typeof processItems>[]) {
      type NestedItem = typeof items[number] & {
        items?: NestedItem[];
        active?: boolean;
      };
      return items.reduce((prev, item) => {
        //const path = (item.path||item.label).split(/\//);
        const path = item.label.replace(/^\//, '').split(/\//);
        const { type } = item;
        if (path.length === 1) {
          prev.push(item);
          return prev;
        }
        let parent = prev;
        let cumulatedPath = '';
        path.forEach((folder, index) => {
          cumulatedPath += `/${folder}`;

          const isFinal = path.length === index + 1;
          if (isFinal) {
            parent.push({
              ...item,
              label: folder,
              active: decodeURIComponent(asPath) === item.href,
            });
            return;
          }

          const target = parent.find(({ label }) => label === folder);

          if (target) {
            if (!target.items) {
              target.items = [];
            }
            parent = target.items;
          } else {
            const color = `#${stringToHexaColor(folder)}`;
            const backgroundColor = new Color(color).fade(0.8).toString();
            const newTarget = {
              type,
              icon: (
                <div
                  className="flex p-[4px] rounded-[3px] justify-center"
                  style={{ color, backgroundColor }}
                >
                  <FolderIcon />
                </div>
              ),
              label: folder,
              tooltip: (
                <>
                  <div className="font-bold">{cumulatedPath}</div>
                </>
              ),
              href: cumulatedPath,
              active: false,
              items: [],
            };
            parent.push(newTarget);
            parent = newTarget.items;
          }
        });
        return prev;
      }, [] as NestedItem[]);
    }

    function setActive(items: ReturnType<typeof generateNesting>) {
      function setActiveRecursive(items: ReturnType<typeof generateNesting>) {
        let isActive = false;
        items.forEach((item) => {
          if (!item.items) {
            isActive = !!item.active;
          } else {
            isActive = item.active = setActiveRecursive(item.items);
          }
        });
        return isActive;
      }
      setActiveRecursive(items);
      return items;
    }

    function sortItems(items: ReturnType<typeof generateNesting>) {
      items.forEach((item) => {
        if (item.items) {
          sortItems(item.items);
        }
      });
      items.sort((a, b) => {
        const aIsFolder = !!a.items;
        const bIsFolder = !!b.items;
        const aLabel = a.label.toLocaleLowerCase();
        const bLabel = b.label.toLocaleLowerCase();
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        if (aLabel > bLabel) return 1;
        if (aLabel < bLabel) return -1;
        return 0;
      });
      return items;
    }

    function filterWithSearchQuery([slug, { name = '', description = '' }]: [
      slug: string,
      item: {
        name?: Prismeai.LocalizedText;
        description?: Prismeai.LocalizedText;
      }
    ]) {
      const template = `${slug.toLocaleLowerCase()} ${(
        localize(name) || ''
      ).toLocaleLowerCase()} ${(
        localize(description) || ''
      ).toLocaleLowerCase()}`;
      return !!template.match(searchQuery);
    }

    return [
      {
        icon: <IconHome />,
        title: t('workspace.sections.activity'),
        href: `/workspaces/${workspace.id}`,
        active: decodeURIComponent(asPath) === `/workspaces/${workspace.id}`,
      },
      {
        type: 'automation',
        icon: <AutomationIcon width={18} height={25} />,
        title: t('workspace.sections.automations'),
        active: decodeURIComponent(asPath).match(
          `^\/workspaces\/${workspace.id}\/automations\//`
        ),
        items: sortItems(
          setActive(
            generateNesting(
              Object.entries(workspace.automations || {})
                .filter(filterWithSearchQuery)
                .map(([slug, automation]) =>
                  processItems({
                    type: 'automation',
                    slug,
                    name: automation.name || slug,
                  })
                )
            )
          )
        ),
        opened: opened.has('automation') || searchQuery,
      },
      {
        type: 'page',
        icon: <PageIcon width={20} height={25} />,
        title: t('workspace.sections.pages'),
        active: decodeURIComponent(asPath).match(
          `^\/workspaces\/${workspace.id}\/pages\//`
        ),
        items: sortItems(
          setActive(
            generateNesting(
              Object.entries(workspace.pages || {})
                .filter(filterWithSearchQuery)
                .map(([slug, page]) =>
                  processItems({ type: 'page', slug, name: page.name || slug })
                )
            )
          )
        ),
        opened: opened.has('page'),
      },
      {
        type: 'block',
        icon: <BlockIcon width={25} height={25} />,
        title: t('workspace.sections.blocks'),
        active: decodeURIComponent(asPath).match(
          `^\/workspaces\/${workspace.id}\/blocks\//`
        ),
        items: sortItems(
          setActive(
            generateNesting(
              Object.entries(workspace.blocks || {})
                .filter(filterWithSearchQuery)
                .map(([slug, block]) =>
                  processItems({
                    type: 'block',
                    slug,
                    name: block.name || slug,
                  })
                )
            )
          )
        ),
        opened: opened.has('block'),
      },
      {
        type: 'app',
        icon: <AppIcon width={25} height={25} />,
        title: t('workspace.sections.apps'),
        active: decodeURIComponent(asPath).match(
          `^\/workspaces\/${workspace.id}\/apps\//`
        ),
        items: sortItems(
          setActive(
            generateNesting(
              Object.entries(workspace.imports || {})
                .filter(([slug, { appName }]) =>
                  filterWithSearchQuery([slug, { name: appName }])
                )
                .map(([slug, app]) =>
                  processItems({
                    type: 'app',
                    slug,
                    name: app.appName || slug,
                    icon: app.photo,
                    tooltip: localize(app.appName || app.appSlug),
                  })
                )
            )
          )
        ),
        opened: opened.has('app'),
      },
      {
        icon: <IconCharts />,
        title: t('workspace.sections.stats'),
        href: `/workspaces/${workspace.id}/stats`,
        active: decodeURIComponent(asPath).match(
          `^/workspaces/${workspace.id}/stats`
        ),
      },
    ];
  }, [
    asPath,
    localize,
    opened,
    searchQuery,
    t,
    workspace.automations,
    workspace.blocks,
    workspace.id,
    workspace.imports,
    workspace.pages,
  ]);
  console.log(decodeURIComponent(asPath));

  return (
    <navigationContext.Provider value={{ add, highlight: searchQuery }}>
      <div className="product-layout-sidebar__items">
        <div
          className={`product-layout-sidebar__item ${
            searchQuery ? '!opacity-100' : ''
          } mt-[4px]`}
        >
          <div className="flex flex-1 text-left relative mt-[10px]">
            <button
              className="product-layout-sidebar__item-button"
              onClick={() => {
                toggleSidebar();
                setTimeout(() => searchInputRef.current?.focus(), 200);
              }}
            >
              <span className="product-layout-sidebar__item-icon">
                <SearchIcon width={23} height={23} />
              </span>
              <span className="product-layout-sidebar__item-label">
                {t('search', { ns: 'common' })}
              </span>
            </button>
            <div
              className={`flex flex-1 absolute top-0 left-0 right-0 transition-opacity opacity-0 ${
                sidebarOpen
                  ? '!opacity-100 pointer-events-all'
                  : 'pointer-events-none'
              }`}
            >
              <form className="flex flex-row flex-1 bg-white py-[10px] pl-[19px] mx-[10px] mt-[-10px] rounded">
                <SearchIcon
                  width={23}
                  height={23}
                  className={opened ? 'text-accent' : ''}
                />
                <input
                  type="search"
                  value={searchQuery}
                  ref={searchInputRef}
                  className="outline-none ml-[13px] text-accent font-[14px] font-medium w-[calc(100%_-_50px)]"
                  onChange={({ target: { value } }) => setSearchQuery(value)}
                />
                <button
                  type="button"
                  className={`absolute top-[5px] right-[15px] text-accent transition-opacity ${
                    searchQuery ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={() => setSearchQuery('')}
                >
                  <CloseIcon width={17} />
                </button>
              </form>
            </div>
          </div>
        </div>
        {navigations.map(({ type, icon, title, href, active, items, opened }) =>
          items ? (
            <RootLinksGroup
              items={items}
              opened={!!opened}
              key={`${type}-${href}`}
            >
              <div
                className={`product-layout-sidebar__item ${
                  active ? 'product-layout-sidebar__item--selected' : ''
                } ${opened ? '!opacity-100' : ''} mt-[4px]`}
              >
                <button
                  className="flex flex-1 text-left"
                  onClick={toggle(type)}
                >
                  <div className="product-layout-sidebar__item-button">
                    <span className="product-layout-sidebar__item-icon">
                      {icon}
                    </span>
                    <span className="product-layout-sidebar__item-label">
                      {title}
                    </span>
                  </div>
                  <div className="product-layout-sidebar__item-label flex-1">
                    {title}
                  </div>
                </button>
                <button
                  type="button"
                  className="flex self-start mr-[17px]"
                  onClick={toggle(type)}
                >
                  <AngleIcon
                    width={23}
                    height={20}
                    className={`transition-transform ${
                      opened ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <Add type={type}>
                  <Tooltip title={t(`workspace.add.${type}`)} placement="right">
                    <button
                      type="button"
                      className="flex self-start mt-[1px] mr-[17px]"
                      onClick={add(type)}
                    >
                      <PlusIcon width={15} height={15} />
                    </button>
                  </Tooltip>
                </Add>
              </div>
            </RootLinksGroup>
          ) : (
            <Link href={href} key={`${href}-${title}`}>
              <a className="product-layout-sidebar__item-link">
                <button
                  className={`product-layout-sidebar__item ${
                    active ? 'product-layout-sidebar__item--selected' : ''
                  }`}
                  type="button"
                >
                  <div className="product-layout-sidebar__item-button">
                    <span className="product-layout-sidebar__item-icon">
                      {icon}
                    </span>
                    <span className="product-layout-sidebar__item-label">
                      {title}
                    </span>
                  </div>
                  <div className="product-layout-sidebar__item-label">
                    {title}
                  </div>
                </button>
              </a>
            </Link>
          )
        )}
      </div>
    </navigationContext.Provider>
  );
};

export const NavigationWithOpenState = () => {
  const {
    workspace: { id },
  } = useWorkspace();
  return (
    <OpenStateProvider id={id}>
      <Navigation />
    </OpenStateProvider>
  );
};
export default NavigationWithOpenState;
