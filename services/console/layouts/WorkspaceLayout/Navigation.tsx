import {
  AppstoreOutlined,
  BranchesOutlined,
  CaretRightOutlined,
  FileOutlined,
  HomeOutlined,
  PlusSquareOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Input, StretchContent, Tooltip } from '@prisme.ai/design-system';
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
} from 'react';
import { useApps } from '../../components/AppsProvider';
import { usePages } from '../../components/PagesProvider';
import { useWorkspace } from '../../components/WorkspaceProvider';
import { search } from '../../utils/filterUtils';
import useLocalizedText from '../../utils/useLocalizedText';

interface NavigationProps extends HTMLAttributes<HTMLDivElement> {
  onCreateAutomation?: () => void;
  onCreatePage?: () => void;
  onInstallApp?: () => void;
}

interface ItemProps {
  href: string;
  icon: ReactChild;
}
const Item: FC<ItemProps> = ({ href, icon, children }) => {
  const { asPath } = useRouter();
  return (
    <div className="flex flex-1 leading-10">
      <Link href={href}>
        <a
          className={`flex flex-row items-baseline ${
            decodeURIComponent(asPath) === href ? 'text-accent' : ''
          }`}
        >
          <div className="flex m-2">{icon}</div>
          <div className="flex flex-1 leading-7">{children}</div>
        </a>
      </Link>
    </div>
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
        <div className="flex flex-1 flex-row items-center">
          <button
            className="flex flex-1 flex-row items-center outline-none focus:outline-none"
            onClick={onClick}
          >
            <CaretRightOutlined
              className={`w-[2rem] transition-transform ${
                open ? 'rotate-90' : ''
              }`}
            />
            <div className="flex flex-1 font-bold">{title}</div>
          </button>
          <Tooltip title={tooltip} placement="left">
            <button
              className="flex outline-none focus:outline-none"
              onClick={onAdd}
            >
              <PlusSquareOutlined />
            </button>
          </Tooltip>
        </div>
        <div className="flex flex-1">
          <StretchContent visible={open}>{children}</StretchContent>
        </div>
      </div>
    </div>
  );
};

export const Navigation = ({
  onCreateAutomation,
  onCreatePage,
  onInstallApp,
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
      Array.from(appInstances.get(id) || []).filter(
        ({ appSlug, slug, appName: name }) =>
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
      <div className="mb-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('workspace.search')}
          value={searchValue}
          onChange={({ target: { value } }) => setSearchValue(value)}
          className="!px-[0.5rem]"
        />
      </div>
      <div
        role="navigation"
        className="flex flex-1 flex-col overflow-auto w-[17.5rem] max-h-[calc(100%-3rem)]"
      >
        <Item
          href={`/workspaces/${id}`}
          icon={
            <Tooltip title={t('workspace.sections.activity')} placement="right">
              <HomeOutlined />
            </Tooltip>
          }
        >
          {t('workspace.sections.activity')}
        </Item>
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
                    <BranchesOutlined />
                  </Tooltip>
                }
              >
                {localize(name)}
              </Item>
            ))}
          </ItemsGroup>
        )}
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
                    <FileOutlined />
                  </Tooltip>
                }
              >
                {localize(name)}
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
                  </Tooltip>
                }
              >
                {localize(name)}
              </Item>
            ))}
          </ItemsGroup>
        )}
      </div>
    </div>
  );
};

export default Navigation;
