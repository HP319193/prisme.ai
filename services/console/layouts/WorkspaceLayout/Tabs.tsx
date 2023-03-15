import { AppstoreOutlined, CloseOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace, WorkspaceContext } from '../../providers/Workspace';
import Storage from '../../utils/Storage';
import { stringToHexaColor } from '../../utils/strings';
import { ReplaceStateEvent } from '../../utils/urls';
import useLocalizedText from '../../utils/useLocalizedText';
import AutomationIcon from './AutomationIcon';
import PageIcon from './PageIcon';

function getTabsFromStorage(workspaceId: string) {
  try {
    return Storage.get(`__tabs_${workspaceId}`);
  } catch (e) {
    console.error(e);
    return [];
  }
}

function getDocument(tab: string, workspace: WorkspaceContext['workspace']) {
  const [slug, type] = tab.split(/\//).reverse();

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
  const [slug] = tab.split(/\//).reverse();
  return slug;
}
function getType(tab: string) {
  const [, type] = tab.split(/\//).reverse();
  return type;
}

interface IconProps {
  tab: string;
  color: string;
  imports?: Prismeai.DSULReadOnly['imports'];
}
const Icon = ({ tab, color, imports }: IconProps) => {
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
      return null;
    default:
      return null;
  }
};

export const Tabs = () => {
  const { asPath, push } = useRouter();
  const { localize } = useLocalizedText();

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
      setTabs((prev) => {
        const prevTabs = Array.from(prev);
        const tabIndex = prevTabs.indexOf(tab);
        const newTabs = prevTabs.filter((t) => t !== tab);
        Storage.set(`__tabs_${workspace.id}`, newTabs);
        if (newTabs.length === 0) {
          push(`/workspaces/${workspace.id}`);
        } else if (newTabs[tabIndex]) {
          push(newTabs[tabIndex]);
        } else {
          push(newTabs[tabIndex - 1]);
        }
        return new Set(newTabs);
      });
    },
    [workspace, push]
  );

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

  return (
    <div className="flex flex-row overflow-auto">
      {Array.from(tabs).map((tab) => (
        <Link key={tab} href={tab} passHref>
          <Tooltip title={localize(getTitle(tab))} placement="bottom">
            <a
              href={tab}
              className={`px-4 py-2 mt-1 pr-1 flex flex-nowrap items-center group border-l border-white ${
                isCurrent(tab)
                  ? 'white border-neutral-200 border-t border-l border-r'
                  : 'bg-neutral-200'
              }  whitespace-nowrap hover:text-base`}
            >
              <div>
                <Icon
                  tab={tab}
                  color={`#${stringToHexaColor(localize(getTitle(tab)))}`}
                  imports={workspace.imports}
                />
              </div>
              <div className="mx-2">{getSlug(tab)}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  close(tab);
                }}
                className="text-sm mr-2 transition-opacity opacity-0 group-hover:opacity-100"
              >
                <CloseOutlined />
              </button>
            </a>
          </Tooltip>
        </Link>
      ))}
    </div>
  );
};

export default Tabs;
