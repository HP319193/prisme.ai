import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaces } from '../providers/Workspaces';
import { cleanSearch, removeEmpty, search } from '../utils/filterUtils';
import { LoadingOutlined } from '@ant-design/icons';
import { Workspace } from '../utils/api';
import getConfig from 'next/config';
import FadeScroll from '../components/FadeScroll';
import { useTracking } from '../components/Tracking';
import Title from '../components/Products/Title';
import Text from '../components/Products/Text';
import Input from '../components/Products/Input';
import Link from 'next/link';
import ProductCard from '../components/Products/ProductCard';
import useLocalizedText from '../utils/useLocalizedText';
import PlusIcon from '../icons/plus.svgr';
import WorkspaceIcon from '../icons/workspace-simple.svgr';
import ThreeDotsIcon from '../icons/three-dots.svgr';
import ImportIcon from '../icons/import.svgr';
import CopyIcon from '../icons/copy.svgr';
import TrashIcon from '../icons/trash.svgr';
import { stringToHexaColor } from '../utils/strings';
import { Dropdown, Menu, notification, Tooltip } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import ConfirmButton from '../components/ConfirmButton';

const {
  publicRuntimeConfig: { SUGGESTIONS_ENDPOINT = '' },
} = getConfig();

const DftWorkspaceIcon = ({ color = 'black' }: { color?: string }) => (
  <div className="flex w-[80px] justify-center">
    <WorkspaceIcon width={40} height={40} style={{ color }} />
  </div>
);

const MenuInCard = ({
  items,
  color = 'text-main-element-text',
}: {
  items: ItemType[];
  color?: string;
}) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        overlay={<Menu items={items} />}
        trigger={['click']}
        className="absolute top-0 right-0 invisible group-hover:visible"
      >
        <button
          onClick={(e) => e.preventDefault()}
          className="flex justify-end p-[30px]"
        >
          <ThreeDotsIcon height={20} className={color} />
        </button>
      </Dropdown>
    </div>
  );
};

export const WorkspacesView = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const [searchValue, setSearchValue] = useState('');
  const { trackEvent } = useTracking();

  const { push } = useRouter();
  const {
    workspaces,
    fetchWorkspaces,
    duplicateWorkspace,
    duplicating,
    importArchive,
    importing,
    deleteWorkspace,
  } = useWorkspaces();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const filteredWorkspaces = useMemo(
    () =>
      workspaces
        .filter(removeEmpty)
        .sort(
          ({ updatedAt: A = 0 }, { updatedAt: B = 0 }) =>
            +new Date(B) - +new Date(A)
        )
        .filter(({ name, description }) =>
          search(cleanSearch(searchValue))(`${name} ${description}`)
        ),
    [searchValue, workspaces]
  );

  const [suggestions, setSuggestions] = useState<Workspace[]>([]);
  useEffect(() => {
    if (!SUGGESTIONS_ENDPOINT) return;
    async function fetchSuggestions() {
      try {
        const res = await fetch(SUGGESTIONS_ENDPOINT);
        if (!res.ok) {
          throw new Error();
        }
        const suggestions: Workspace[] = await res.json();
        if (!Array.isArray(suggestions)) return;
        setSuggestions(suggestions.filter(({ id, name }) => id && name));
      } catch (e) {
        return;
      }
    }
    fetchSuggestions();
  }, []);

  const filteredSuggestions = useMemo(
    () =>
      suggestions.filter(({ name, description }) =>
        search(cleanSearch(searchValue))(`${name} ${description}`)
      ),
    [searchValue, suggestions]
  );

  const handleDuplicateWorkspace = useCallback(
    async (id: Workspace['id'], type?: 'suggestion') => {
      const workspace = await duplicateWorkspace(id);
      if (!workspace) return;
      trackEvent({
        name:
          type === 'suggestion'
            ? 'Install Workspace suggestion'
            : 'Duplicate Workspace',
        category: 'Workspaces',
        action: 'click',
      });
      push(`/workspaces/${workspace.id}`);
    },
    [duplicateWorkspace, push, trackEvent]
  );

  const handleImportArchive = useCallback(
    async (file: File, workspaceId?: string) => {
      const workspace = await importArchive(file, workspaceId);
      if (!workspace) return;
      push(`/workspaces/${workspace.id}`);
    },
    [importArchive, push]
  );

  const handlePickArchive = useCallback(
    async (workspaceId?: string) => {
      trackEvent({
        name: 'Import Archive',
        category: 'Workspaces',
        action: 'click',
      });
      const filePickr = document.createElement('input');
      filePickr.setAttribute('type', 'file');
      filePickr.setAttribute('accept', '.zip');
      document.body.appendChild(filePickr);
      filePickr.addEventListener('change', async (e: any) => {
        filePickr.parentNode?.removeChild(filePickr);
        const { files } = e.target as HTMLInputElement;
        if (!files) return;
        handleImportArchive(files[0], workspaceId);
      });
      filePickr.addEventListener('cancel', () => {
        filePickr.parentNode?.removeChild(filePickr);
      });
      filePickr.click();
    },
    [handleImportArchive, trackEvent]
  );

  const handleDeleteWorkspace = useCallback(
    (workspaceId: string) => {
      deleteWorkspace(workspaceId);
      notification.success({
        message: t('workspace.delete.toast'),
        placement: 'bottomRight',
      });
    },
    [deleteWorkspace, t]
  );

  const getWorkspaceMenu = useCallback(
    (workspaceId: string): ItemType[] => [
      {
        key: 'duplicate',
        label: (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (duplicating.has(workspaceId)) return;
              handleDuplicateWorkspace(workspaceId);
            }}
            className="focus:outline-none flex items-center w-[100%]"
          >
            {duplicating.has(workspaceId) ? <LoadingOutlined /> : <CopyIcon />}
            <span className="ml-3">{t('workspace.duplicate.label')}</span>
          </button>
        ),
      },
      {
        key: 'import',
        label: (
          <ConfirmButton
            confirmLabel={t('workspace.import.confirm')}
            onConfirm={() => handlePickArchive(workspaceId)}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="focus:outline-none flex items-center"
            ButtonComponent="button"
          >
            {importing ? <LoadingOutlined /> : <ImportIcon />}
            <span className="ml-3">{t('workspace.import.replace')}</span>
          </ConfirmButton>
        ),
      },
      {
        key: 'delete',
        label: (
          <ConfirmButton
            confirmLabel={t('workspace.delete.confirm')}
            onConfirm={() => handleDeleteWorkspace(workspaceId)}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="focus:outline-none flex items-center"
            ButtonComponent="button"
          >
            <TrashIcon />
            <span className="ml-3">{t('workspace.delete.label')}</span>
          </ConfirmButton>
        ),
      },
    ],
    [
      duplicating,
      handleDeleteWorkspace,
      handleDuplicateWorkspace,
      handlePickArchive,
      importing,
      t,
    ]
  );
  const createMenu: ItemType[] = useMemo(
    () => [
      {
        key: 'create',
        label: (
          <Link href="/workspaces/new">
            <a className="flex items-center">
              <PlusIcon />
              <span className="ml-3">{t('workspace.create.label')}</span>
            </a>
          </Link>
        ),
      },
      {
        key: 'import',
        label: (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (importing) return;
              handlePickArchive();
            }}
            className="focus:outline-none flex items-center"
          >
            {importing ? <LoadingOutlined /> : <ImportIcon />}
            <span className="ml-3">{t('workspace.import.label')}</span>
          </button>
        ),
      },
    ],
    [handlePickArchive, importing, t]
  );

  const cardEl = useRef<HTMLAnchorElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  useEffect(() => {
    if (!cardEl.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCardWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(cardEl.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-main-surface flex flex-1 flex-col py-[25px] px-[53px] overflow-auto">
      <div className="flex flex-1 flex-col ">
        <Title className="text-products-xl">
          {t('workspaces.welcome.title')}
        </Title>
        <Text>{t('workspaces.welcome.description')}</Text>
        <Text>
          <span
            dangerouslySetInnerHTML={{
              __html: t('workspaces.welcome.help'),
            }}
          />
        </Text>
        <div className="flex flex-col mr-[15px] relative mt-11 mb-12">
          <Input
            search
            placeholder={t('workspaces.search')}
            onChange={({ target: { value } }) => setSearchValue(value)}
          />
        </div>
        <Title className="mt-11">{t('workspaces.suggestions.title')}</Title>
        <div className="flex flex-row flex-wrap -ml-[13px]">
          <FadeScroll className="flex-1 pb-4 -mb-4 w-[100%]">
            {filteredSuggestions.map(({ id, description, name, photo }) => (
              <div
                key={id}
                className="relative group w-[100%]  overflow-hidden"
                style={{
                  width: `${cardWidth}px`,
                }}
              >
                <ProductCard
                  title={localize(name)}
                  description={localize(description)}
                  icon={
                    photo || (
                      <DftWorkspaceIcon color={`#${stringToHexaColor(name)}`} />
                    )
                  }
                />
                <Tooltip
                  title={
                    duplicating.has(id)
                      ? t('workspace.duplicate.duplicating')
                      : t('workspace.duplicate.label')
                  }
                  placement="left"
                >
                  <button
                    className="absolute bottom-[30px] right-[30px]"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (duplicating.has(id)) return;
                      handleDuplicateWorkspace(id);
                    }}
                  >
                    {duplicating.has(id) ? (
                      <LoadingOutlined className="!text-main-element-text [&>svg]:w-[24px] [&>svg]:h-[24px]" />
                    ) : (
                      <CopyIcon
                        className="text-main-element-text"
                        width={24}
                        height={24}
                      />
                    )}
                  </button>
                </Tooltip>
              </div>
            ))}
          </FadeScroll>
        </div>
        <Title className="mt-11">{t('workspaces.sectionTitle')}</Title>
        <div className="flex flex-row flex-wrap -ml-[13px]">
          <Link href="/workspaces/new" key="new">
            <a
              ref={cardEl}
              className="relative group w-[100%] 2xl:w-1/5 xl:w-1/4 lg:w-1/3 md:w-1/2 overflow-hidden"
            >
              <ProductCard
                title={t('create.label')}
                description={t('create.description')}
                icon={
                  <div className="bg-accent rounded m-[30px]">
                    <PlusIcon
                      width={32}
                      height={32}
                      className="text-white m-[18px]"
                    />
                  </div>
                }
                className="rounded border-dashed border-[1px] border-[1BFBFBF] !bg-transparent"
                textColor="text-white"
              />
              <MenuInCard items={createMenu} color="text-main-text" />
            </a>
          </Link>
          {filteredWorkspaces.map(({ id, description, name, photo }) => (
            <Link href={`/workspaces/${id}`} key={id}>
              <a className="relative group w-[100%] 2xl:w-1/5 xl:w-1/4 lg:w-1/3 md:w-1/2">
                <ProductCard
                  title={localize(name)}
                  description={localize(description)}
                  icon={
                    photo || (
                      <DftWorkspaceIcon color={`#${stringToHexaColor(name)}`} />
                    )
                  }
                />
                <MenuInCard items={getWorkspaceMenu(id)} />
                <div className="absolute bottom-[30px] right-[30px] text-main-element-text underline">
                  {t('edit.label')}
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspacesView;
