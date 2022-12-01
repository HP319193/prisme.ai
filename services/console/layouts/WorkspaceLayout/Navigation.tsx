import { AppstoreOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { StretchContent, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FC,
  ReactChild,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  HTMLAttributes,
  ReactElement,
} from 'react';
import { useApps } from '../../components/AppsProvider';
import { usePages } from '../../components/PagesProvider';
import { useWorkspace } from '../../components/WorkspaceProvider';
import { search } from '../../utils/filterUtils';
import useLocalizedText from '../../utils/useLocalizedText';
import ChevronIcon from '../../icons/chevron.svgr';
import AutomationIcon from './AutomationIcon';
import { stringToHexaColor } from '../../utils/strings';
import PageIcon from './PageIcon';
import HomeIcon from '../../icons/home.svgr';
import HomeIconOutlined from '../../icons/home-outlined.svgr';
import SearchInput from './SearchInput';
import Highlight from '../../components/Highlight/Highlight';

interface NavigationProps extends HTMLAttributes<HTMLDivElement> {
  onCreateAutomation?: () => void;
  onCreatePage?: () => void;
  onInstallApp?: () => void;
  onExpand?: () => void;
}

interface ItemProps {
  href: string;
  icon: ReactChild | ((props: { selected: Boolean }) => ReactElement);
}
const Item: FC<ItemProps> = ({ href, icon: Icon, children }) => {
  const { asPath } = useRouter();
  const selected = decodeURIComponent(asPath) === href;
  return (
    <Link href={href}>
      <a
        className={`flex flex-1 leading-10 px-4 py-2 group hover:bg-ultra-light-accent !text-base ${
          selected ? 'bg-ultra-light-accent font-bold' : ''
        }`}
      >
        <div
          className={`flex flex-1 flex-row items-center ${
            selected ? 'text-accent' : ''
          } max-w-[85%]`}
        >
          <div className="flex m-2 mr-4">
            {typeof Icon === 'function' ? <Icon selected={selected} /> : Icon}
          </div>
          <div className="flex flex-1 leading-7 max-w-full">{children}</div>
        </div>
      </a>
    </Link>
  );
};

interface ItemsGroupProps {
  title: string;
  onClick?: () => void;
  onAdd?: () => void;
  tooltip?: string;
  open: boolean;
}
const ItemsGroup: FC<ItemsGroupProps> = ({
  title,
  open,
  onClick,
  onAdd,
  tooltip = '',
  children,
}) => {
  return (
    <div className="flex flex-1 leading-[2.5rem]">
      <div className="flex flex-1 flex-col max-w-full">
        <div className="flex flex-1 flex-row items-center border-b-[1px]">
          <button
            className="flex flex-1 flex-row items-center outline-none focus:outline-none p-4"
            onClick={onClick}
          >
            <Tooltip title={title} placement="left">
              <div className="flex m-2 mr-4 w-[1.6rem] h-[1.6rem] justify-center">
                <ChevronIcon
                  width="1rem"
                  className={` transition-transform ${
                    open ? '' : '-rotate-90'
                  }`}
                />
              </div>
            </Tooltip>
            <div className="flex flex-1 font-bold">{title}</div>
          </button>
          <Tooltip title={tooltip} placement="left">
            <button
              className="flex outline-none focus:outline-none p-4 hover:text-accent"
              onClick={onAdd}
            >
              <PlusCircleOutlined />
            </button>
          </Tooltip>
        </div>
        <div className="flex flex-1">
          <StretchContent visible={open} className="whitespace-nowrap flex-1">
            {children}
          </StretchContent>
        </div>
      </div>
    </div>
  );
};

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
    workspace: { id, automations = {} },
  } = useWorkspace();
  const { appInstances } = useApps();
  const { pages } = usePages();

  const types = ['automations', 'pages', 'apps'] as const;

  const [opens, setOpens] = useState<Map<typeof types[number], boolean>>(
    new Map()
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
      Object.entries(automations).filter(([slug, { name, description }]) =>
        search(searchValue)(
          `${slug} ${localize(name)} ${localize(description)}}`
        )
      ),
    [automations, localize, searchValue]
  );
  const filteredPages = useMemo(
    () =>
      Array.from(pages.get(id) || []).filter(({ slug, name, description }) =>
        search(searchValue)(
          `${slug} ${localize(name)} ${localize(description)}}`
        )
      ),
    [id, localize, pages, searchValue]
  );
  const filteredApps = useMemo(
    () =>
      Array.from(
        appInstances.get(id) || []
      ).filter(({ appSlug, slug, appName: name }) =>
        search(searchValue)(`${appSlug} ${slug} ${localize(name)}}`)
      ),
    [appInstances, id, localize, searchValue]
  );

  useEffect(() => {
    const path = decodeURIComponent(asPath);
    const data: Record<typeof types[number], string[]> = {
      automations: Object.keys(automations).map(
        (slug) => `/workspaces/${id}/automations/${slug}`
      ),
      pages: Array.from(pages.get(id) || []).map(
        ({ id: pageId }) => `/workspaces/${id}/pages/${pageId}`
      ),
      apps: Array.from(appInstances.get(id) || []).map(
        ({ slug }) => `/workspaces/${id}/apps/${slug}`
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
  }, [appInstances, asPath, automations, id, pages, toggle]);

  return (
    <div className={`flex flex-col max-h-full ${props.className}`} {...props}>
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        onFocus={onExpand}
      />
      <div
        role="navigation"
        className="flex flex-1 flex-col overflow-auto max-h-[calc(100%-3rem)]"
      >
        <div className="border-b-[1px]">
          <Item
            href={`/workspaces/${id}`}
            icon={({ selected }) => (
              <Tooltip
                title={t('workspace.sections.activity')}
                placement="right"
              >
                <div className="mb-1">
                  {selected ? (
                    <HomeIcon width="1.6rem" height="1.6rem" />
                  ) : (
                    <HomeIconOutlined width="1.6rem" height="1.6rem" />
                  )}
                </div>
              </Tooltip>
            )}
          >
            {t('workspace.sections.activity')}
          </Item>
        </div>
        {!(searchValue && filteredPages.length === 0) && (
          <ItemsGroup
            title={t('workspace.sections.pages')}
            onClick={toggle('pages')}
            open={
              !!opens.get('pages') ||
              (!!searchValue && filteredPages.length > 0)
            }
            onAdd={onCreatePage}
            tooltip={t('workspace.add.page')}
          >
            {filteredPages.map(({ id: slug, name }) => (
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
        {!(searchValue && filteredAutomations.length === 0) && (
          <ItemsGroup
            title={t('workspace.sections.automations')}
            onClick={toggle('automations')}
            open={
              !!opens.get('automations') ||
              (!!searchValue && filteredAutomations.length > 0)
            }
            onAdd={onCreateAutomation}
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
            {filteredApps.map(({ slug, appName: name, photo }) => (
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
