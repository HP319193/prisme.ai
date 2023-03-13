import { CloseOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import {
  useWorkspace,
  workspaceContext,
  WorkspaceContext,
} from '../../providers/Workspace';
import { Workspace } from '../../utils/api';
import Storage from '../../utils/Storage';
import useLocalizedText from '../../utils/useLocalizedText';

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

export const Tabs = () => {
  const { asPath, push } = useRouter();
  const { localize } = useLocalizedText();

  const { workspace } = useWorkspace();
  const [tabs, setTabs] = useState<Set<string>>(
    new Set(getTabsFromStorage(workspace.id))
  );

  useEffect(() => {
    const tab = decodeURIComponent(asPath);

    if (!getDocument(tab, workspace)) return;

    setTabs((prev) => {
      const newTabs = [...Array.from(prev), tab];
      Storage.set(`__tabs_${workspace.id}`, newTabs);
      return new Set(newTabs);
    });
  }, [asPath, workspace]);

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
  const getSlug = useCallback((tab: string) => {
    const [slug] = tab.split(/\//).reverse();
    return slug;
  }, []);
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
  const isCurrent = useCallback(
    (tab: string) => {
      const [slug, type] = tab.split(/\//).reverse();
      const [currentSlug, currentType] = decodeURIComponent(asPath)
        .split(/\//)
        .reverse();
      return slug === currentSlug && type === currentType;
    },
    [asPath]
  );

  return (
    <div className="flex flex-row overflow-auto">
      {Array.from(tabs).map((tab) => (
        <Link key={tab} href={tab} passHref>
          <Tooltip title={localize(getTitle(tab))} placement="bottom">
            <a
              href={tab}
              className={`px-4 py-2 mt-1 flex flex-nowrap group border-l border-white ${
                isCurrent(tab)
                  ? 'white border-neutral-200 border-t border-l border-r'
                  : 'bg-neutral-200'
              }  whitespace-nowrap hover:text-base`}
            >
              {getSlug(tab)}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  close(tab);
                }}
                className="text-sm ml-2 transition-opacity opacity-0 group-hover:opacity-100"
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
