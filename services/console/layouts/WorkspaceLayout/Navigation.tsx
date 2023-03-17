import { AppstoreOutlined } from '@ant-design/icons';
import { Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  HTMLAttributes,
} from 'react';
import { search } from '../../utils/filterUtils';
import useLocalizedText from '../../utils/useLocalizedText';

import AutomationIcon from './AutomationIcon';
import { stringToHexaColor } from '../../utils/strings';
import PageIcon from './PageIcon';
import HomeIcon from '../../icons/home.svgr';
import HomeIconOutlined from '../../icons/home-outlined.svgr';
import Highlight from '../../components/Highlight/Highlight';
import { useWorkspace } from '../../providers/Workspace';
import Item from '../../components/Navigation/Item';
import ItemsGroup, {
  ItemsGroupProps,
} from '../../components/Navigation/ItemsGroup';
import SearchInput from '../../components/Navigation/SearchInput';

interface NavigationProps extends HTMLAttributes<HTMLDivElement> {
  onCreateAutomation?: () => void;
  onCreatePage?: () => void;
  onInstallApp?: () => void;
  onExpand?: () => void;
}

const EMPTY_AUTOMATIONS: Prismeai.DSULReadOnly['automations'] = {};
const EMPTY_PAGES: Prismeai.DSULReadOnly['pages'] = {};
const EMPTY_IMPORTS: Prismeai.DSULReadOnly['imports'] = {};

export const Navigation = ({
  onCreateAutomation,
  onCreatePage,
  onInstallApp,
  onExpand,
  ...props
}: NavigationProps) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { asPath } = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const {
    workspace: {
      id,
      automations = EMPTY_AUTOMATIONS,
      pages = EMPTY_PAGES,
      imports = EMPTY_IMPORTS,
    },
    creatingAutomation,
    creatingPage,
  } = useWorkspace();
  const types = ['automations', 'pages', 'apps'] as const;

  const [opens, setOpens] = useState<Map<typeof types[number], boolean>>(
    new Map(
      types.map((type) => {
        switch (type) {
          case 'pages':
            return [
              type,
              Object.keys(pages).findIndex(
                (slug) => `/workspaces/${id}/pages/${slug}` === asPath
              ) > -1,
            ];
          case 'automations':
            return [
              type,
              Object.keys(automations).findIndex(
                (slug) => `/workspaces/${id}/automations/${slug}` === asPath
              ) > -1,
            ];
          case 'apps':
            return [
              type,
              Object.keys(imports).findIndex(
                (slug) => `/workspaces/${id}/apps/${slug}` === asPath
              ) > -1,
            ];
          default:
            return [type, false];
        }
      })
    )
  );
  const toggles = useRef<Map<typeof types[number], ItemsGroupProps['onClick']>>(
    new Map()
  );
  const toggle = useCallback((id: typeof types[number]) => {
    if (!toggles.current.get(id)) {
      toggles.current.set(id, () =>
        setOpens((opens) => {
          const newOpens = new Map(opens);
          newOpens.set(id, !opens.get(id));
          return newOpens;
        })
      );
    }
    return toggles.current.get(id);
  }, []);

  const filteredAutomations = useMemo(
    () =>
      Object.entries(automations)
        .filter(([slug, { name, description }]) =>
          search(searchValue)(
            `${slug} ${localize(name)} ${localize(description)}}`
          )
        )
        .sort(([a], [b]) => {
          if (a.toLowerCase() < b.toLowerCase()) return -1;
          if (a.toLowerCase() > b.toLowerCase()) return 1;
          return 0;
        }),
    [automations, localize, searchValue]
  );
  const filteredPages = useMemo(
    () =>
      Object.entries(pages)
        .filter(([slug, { name, description }]) =>
          search(searchValue)(
            `${slug} ${localize(name)} ${localize(description)}}`
          )
        )
        .sort(([a], [b]) => {
          if (a.toLowerCase() < b.toLowerCase()) return -1;
          if (a.toLowerCase() > b.toLowerCase()) return 1;
          return 0;
        }),
    [localize, pages, searchValue]
  );
  const filteredApps = useMemo(
    () =>
      Object.entries(imports)
        .filter(([slug, { appSlug, appName }]) =>
          search(searchValue)(`${appSlug} ${slug} ${localize(appName)}}`)
        )
        .sort(([a], [b]) => {
          if (a.toLowerCase() < b.toLowerCase()) return -1;
          if (a.toLowerCase() > b.toLowerCase()) return 1;
          return 0;
        }),
    [imports, localize, searchValue]
  );

  useEffect(() => {
    const path = decodeURIComponent(asPath);
    const data: Record<typeof types[number], string[]> = {
      automations: Object.keys(automations).map(
        (slug) => `/workspaces/${id}/automations/${slug}`
      ),
      pages: Object.values(pages).map(
        ({ id }) => `/workspaces/${id}/pages/${id}`
      ),
      apps: Object.keys(imports).map(
        (slug) => `/workspaces/${id}/apps/${slug}`
      ),
    };
    setOpens((opens) => {
      const newOpens = new Map(opens);
      let changed = false;
      Object.entries(data).map(([type, hrefs]) => {
        if (hrefs.includes(path) && !opens.get(type as typeof types[number])) {
          newOpens.set(type as typeof types[number], true);
          changed = true;
        }
      });
      return changed ? newOpens : opens;
    });
  }, [asPath, automations, id, imports, pages, toggle]);

  return (
    <div className={`flex flex-col max-h-full ${props.className}`} {...props}>
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        onFocus={onExpand}
      />
      <div
        role="navigation"
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden max-h-[calc(100%-3rem)]"
      >
        {!(searchValue && filteredPages.length === 0) && (
          <ItemsGroup
            title={t('workspace.sections.pages')}
            onClick={toggle('pages')}
            open={
              !!opens.get('pages') ||
              (!!searchValue && filteredPages.length > 0)
            }
            onAdd={onCreatePage}
            creating={creatingPage}
            tooltip={t('workspace.add.page')}
          >
            {filteredPages.map(([slug, { name }]) => (
              <Item
                key={slug}
                href={`/workspaces/${id}/pages/${slug}`}
                icon={
                  <Tooltip title={localize(name)} placement="right">
                    <div>
                      <PageIcon
                        color={`#${stringToHexaColor(localize(name))}`}
                        width="1.6rem"
                        height="1.6rem"
                      />
                    </div>
                  </Tooltip>
                }
              >
                <div className="flex flex-1 flex-col max-w-full">
                  <div className="text-ellipsis overflow-hidden">
                    <Highlight
                      highlight={searchValue}
                      component={<span className="font-bold text-accent" />}
                    >
                      {localize(name)}
                    </Highlight>
                  </div>
                  <div className="text-ellipsis overflow-hidden text-xs text-gray">
                    <Highlight
                      highlight={searchValue}
                      component={<span className="font-bold text-accent" />}
                    >
                      {`/${slug}`}
                    </Highlight>
                  </div>
                </div>
              </Item>
            ))}
          </ItemsGroup>
        )}
        {!(searchValue && filteredAutomations.length === 0) && (
          <ItemsGroup
            title={t('workspace.sections.automations')}
            onClick={toggle('automations')}
            open={
              !!opens.get('automations') ||
              (!!searchValue && filteredAutomations.length > 0)
            }
            onAdd={onCreateAutomation}
            creating={creatingAutomation}
            tooltip={t('workspace.add.automation')}
          >
            {filteredAutomations.map(([slug, { name }]) => (
              <Item
                key={slug}
                href={`/workspaces/${id}/automations/${slug}`}
                icon={
                  <Tooltip title={localize(name)} placement="right">
                    <div>
                      <AutomationIcon
                        color={`#${stringToHexaColor(localize(name))}`}
                        width="1.6rem"
                        height="1.6rem"
                      />
                    </div>
                  </Tooltip>
                }
              >
                <div className="flex flex-1 flex-col max-w-full">
                  <div className="text-ellipsis overflow-hidden">
                    <Highlight
                      highlight={searchValue}
                      component={<span className="font-bold text-accent" />}
                    >
                      {localize(name)}
                    </Highlight>
                  </div>
                  <div className="text-ellipsis overflow-hidden text-xs text-gray">
                    <Highlight
                      highlight={searchValue}
                      component={<span className="font-bold text-accent" />}
                    >
                      {`/${slug}`}
                    </Highlight>
                  </div>
                </div>
              </Item>
            ))}
          </ItemsGroup>
        )}
        {!(searchValue && filteredApps.length === 0) && (
          <ItemsGroup
            title={t('workspace.sections.apps')}
            onClick={toggle('apps')}
            open={
              !!opens.get('apps') || (!!searchValue && filteredApps.length > 0)
            }
            onAdd={onInstallApp}
            tooltip={t('workspace.add.app')}
          >
            {filteredApps.map(([slug, { appName: name = slug, photo }]) => (
              <Item
                key={slug}
                href={`/workspaces/${id}/apps/${slug}`}
                icon={
                  <Tooltip title={localize(name)} placement="right">
                    <div className="w-[1.6rem] h-[1.6rem]">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo}
                          height={22}
                          width={22}
                          alt={localize(name)}
                        />
                      ) : (
                        <AppstoreOutlined />
                      )}
                    </div>
                  </Tooltip>
                }
              >
                <div className="text-ellipsis overflow-hidden">
                  <Highlight
                    highlight={searchValue}
                    component={<span className="font-bold text-accent" />}
                  >
                    {localize(name)}
                  </Highlight>
                </div>
              </Item>
            ))}
          </ItemsGroup>
        )}
      </div>
    </div>
  );
};

export default Navigation;
