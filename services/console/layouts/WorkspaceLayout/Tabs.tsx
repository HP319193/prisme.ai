import { AppstoreOutlined, CloseOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Tooltip } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace, WorkspaceContext } from '../../providers/Workspace';
import Storage from '../../utils/Storage';
import { stringToHexaColor } from '../../utils/strings';
import { ReplaceStateEvent } from '../../utils/urls';
import useLocalizedText from '../../utils/useLocalizedText';
import AutomationIcon from './AutomationIcon';
import PageIcon from './PageIcon';
import HomeIconOutlined from '../../icons/home-outlined.svgr';
import MenuItem from 'antd/lib/menu/MenuItem';
import { useTranslation } from 'next-i18next';
import { useTracking } from '../../components/Tracking';

function getTabsFromStorage(workspaceId: string) {
  try {
    return Storage.get(`__tabs_${workspaceId}`);
  } catch (e) {
    console.error(e);
    return [];
  }
}

function getDocument(tab: string, workspace: WorkspaceContext['workspace']) {
  const [, , type, slug] =
    tab.match(/(^.+)(automations|pages|apps)\/(.+$)/) || [];

  switch (type) {
    case 'automations':
      return (workspace.automations || {})[slug];
    case 'pages':
      return (workspace.pages || {})[slug];
    case 'apps':
      return (workspace.imports || {})[slug];
  }
  return null;
}

function getSlug(tab: string) {
  const [, , , slug] = tab.match(/(^.+)(automations|pages|apps)\/(.+$)/) || [];
  return slug;
}
function getType(tab: string) {
  const [, , type] = tab.match(/(^.+)(automations|pages|apps)\/(.+$)/) || [];
  return type;
}

interface IconProps {
  tab: string;
  color: string;
}
const Icon = ({ tab, color }: IconProps) => {
  const {
    workspace: { imports },
  } = useWorkspace();
  const type = getType(tab);
  const slug = getSlug(tab);

  switch (type) {
    case 'automations':
      return <AutomationIcon color={color} />;
    case 'pages':
      return <PageIcon color={color} />;
    case 'apps':
      const photo = imports && imports[slug]?.photo;

      if (photo)
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} height={22} width={22} alt={tab} />
        );
      return <AppstoreOutlined />;
    default:
      return null;
  }
};

interface TabProps {
  href: string;
  label: string;
  title: string;
  isCurrent?: boolean;
  previousIsCurrent?: boolean;
  onClose?: (e: React.MouseEvent) => void;
  className?: string;
  icon?: ReactNode;
}
const Tab = ({
  href,
  label,
  title,
  isCurrent,
  previousIsCurrent,
  onClose,
  className = '',
  icon,
}: TabProps) => {
  const { trackEvent } = useTracking();
  return (
    <Link href={href} passHref>
      <Tooltip title={title} placement="bottom">
        <a
          href={href}
          className={`px-4 py-[0.75rem] pb-[0.75rem] mt-1 pr-1 flex flex-nowrap items-center group rounded-t ${
            isCurrent ? 'bg-white font-bold' : ''
          }  whitespace-nowrap hover:text-base ${className}`}
          onClick={() => {
            trackEvent({
              category: 'Tabs',
              name: 'Navigate with Tab',
              action: 'click',
            });
          }}
        >
          {!isCurrent && !previousIsCurrent && (
            <div className="border-l border-light-gray h-full mr-4 -ml-6" />
          )}
          <div>
            {icon || <Icon tab={href} color={`#${stringToHexaColor(title)}`} />}
          </div>
          <div className="mx-2">{label}</div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-sm mr-2 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <CloseOutlined />
            </button>
          )}
        </a>
      </Tooltip>
    </Link>
  );
};

export const Tabs = () => {
  const { asPath, push } = useRouter();
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();

  const { workspace } = useWorkspace();
  const [tabs, setTabs] = useState<Set<string>>(
    new Set(getTabsFromStorage(workspace.id))
  );

  const workspaceLinks = useMemo(() => {
    return new Set([
      ...Object.keys(workspace.automations || {}).map(
        (slug) => `/workspaces/${workspace.id}/automations/${slug}`
      ),
      ...Object.keys(workspace.pages || {}).map(
        (slug) => `/workspaces/${workspace.id}/pages/${slug}`
      ),
      ...Object.keys(workspace.imports || {}).map(
        (slug) => `/workspaces/${workspace.id}/apps/${slug}`
      ),
    ]);
  }, [workspace]);

  useEffect(() => {
    setTabs((prev) => {
      const prevSize = prev.size;
      const filtered = Array.from(prev).filter((tab) =>
        workspaceLinks.has(tab)
      );
      if (filtered.length !== prevSize) return new Set(filtered);
      return prev;
    });
  }, [workspaceLinks]);

  useEffect(() => {
    const listener = (e: Event) => {
      const { prevLocation, nextLocation } = e as ReplaceStateEvent;
      setTabs(
        (prev) =>
          new Set(
            Array.from(prev).map((tab) =>
              tab === prevLocation ? nextLocation : tab
            )
          )
      );
    };
    window.addEventListener('replaceState', listener);

    return () => {
      window.removeEventListener('replaceState', listener);
    };
  }, []);

  useEffect(() => {
    const tab = decodeURIComponent(asPath);

    if (!workspaceLinks.has(tab)) return;

    setTabs((prev) => {
      const newTabs = [...Array.from(prev), tab];
      Storage.set(`__tabs_${workspace.id}`, newTabs);
      return new Set(newTabs);
    });
  }, [asPath, workspace, workspaceLinks]);

  const close = useCallback(
    (tab: string) => {
      trackEvent({
        category: 'Tabs',
        name: 'Close tab',
        action: 'click',
      });
      setTabs((prev) => {
        const prevTabs = Array.from(prev);
        const tabIndex = prevTabs.indexOf(tab);
        const newTabs = prevTabs.filter((t) => t !== tab);
        Storage.set(`__tabs_${workspace.id}`, newTabs);
        if (tab === asPath) {
          if (newTabs.length === 0) {
            push(`/workspaces/${workspace.id}`);
          } else if (newTabs[tabIndex]) {
            push(newTabs[tabIndex]);
          } else {
            push(newTabs[tabIndex - 1]);
          }
        }
        return new Set(newTabs);
      });
    },
    [trackEvent, workspace.id, asPath, push]
  );

  const closeAll = useCallback(() => {
    trackEvent({
      category: 'Tabs',
      name: 'Close all tabs',
      action: 'click',
    });
    setTabs(new Set());
    Storage.remove(`__tabs_${workspace.id}`);
    push(`/workspaces/${workspace.id}`);
  }, [push, trackEvent, workspace.id]);

  const getTitle = useCallback(
    (tab: string) => {
      const doc = getDocument(tab, workspace);
      if (!doc) return '';

      return (
        (doc as Prismeai.AutomationMeta).name ||
        (doc as Prismeai.AppInstanceMeta).appSlug
      );
    },
    [workspace]
  );

  const isCurrent = useCallback((tab: string) => {
    const [, , ...url] = window.location.pathname.split(/\//);
    const path = `/${url.join('/')}`;
    const [slug, type] = tab.split(/\//).reverse();
    const [currentSlug, currentType] = decodeURIComponent(path)
      .split(/\//)
      .reverse();
    return slug === currentSlug && type === currentType;
  }, []);

  const previousIsCurrent = useCallback(
    (tab: string) => {
      const previousIndex = Array.from(tabs).indexOf(tab) - 1;
      const previous =
        previousIndex < 0
          ? `/workspaces/${workspace.id}`
          : Array.from(tabs)[previousIndex];

      return !!previous && isCurrent(previous);
    },
    [isCurrent, tabs, workspace.id]
  );

  return (
    <div className="flex flex-row justify-between bg-ultra-light-accent pt-[0.55rem] -mb-[1px]">
      <div className="flex flex-row overflow-auto">
        <Tab
          label={t('events.title')}
          title={t('events.title')}
          href={`/workspaces/${workspace.id}`}
          isCurrent={isCurrent(`/workspaces/${workspace.id}`)}
          previousIsCurrent={previousIsCurrent(`/workspaces/${workspace.id}`)}
          className="!pr-4"
          icon={<HomeIconOutlined className="mx-2" />}
        />
        {Array.from(tabs).map((tab) => (
          <Tab
            key={tab}
            label={getSlug(tab)}
            title={localize(getTitle(tab))}
            href={tab}
            isCurrent={isCurrent(tab)}
            previousIsCurrent={previousIsCurrent(tab)}
            onClose={(e) => {
              e.preventDefault();
              close(tab);
            }}
          />
        ))}
      </div>
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu>
            <MenuItem className="whitespace-nowrap" onClick={closeAll}>
              {t('workspace.tabs.closeAll')}
            </MenuItem>
          </Menu>
        }
      >
        <button className="p-4 rotate-90">•••</button>
      </Dropdown>
    </div>
  );
};

export default Tabs;
