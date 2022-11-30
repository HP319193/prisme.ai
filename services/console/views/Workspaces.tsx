import { Input, Layout, notification } from '@prisme.ai/design-system';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import packageJson from '../../../package.json';
import Header from '../components/Header';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useUser } from '../components/UserProvider';
import plus from '../icons/plus.svg';
import { removeEmpty, search } from '../utils/filterUtils';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import WorkspaceMenu from '../components/Workspaces/WorkspaceMenu';
import { Workspace } from '../utils/api';
import HeaderPopovers from './HeaderPopovers';
import CardButton from '../components/Workspaces/CardButton';
import WorkspaceCardButton from '../components/Workspaces/WorkspaceCardButton';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { SUGGESTIONS_ENDPOINT = '' },
} = getConfig();

export const WorkspacesView = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const { workspaces, create, duplicate } = useWorkspaces();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const workspacesList = useMemo(
    () => Array.from(workspaces.values()).filter(removeEmpty),
    [workspaces]
  );
  const filtredWorkspacesList = useMemo(
    () =>
      workspacesList.filter(({ name, description }) =>
        search(searchValue)(`${name} ${description}`)
      ),
    [searchValue, workspacesList]
  );

  const createWorkspace = useCallback(async () => {
    setLoading(true);
    const { id } = await create(t('create.defaultName'));
    push(`/workspaces/${id}`);
    setLoading(false);
  }, [create, push, t]);

  const duplicateWorkspace = useCallback(
    (id: Workspace['id']) => async () => {
      const workspace = workspaces.get(id);
      if (!workspace) {
        notification.warn({
          message: t('workspaces.suggestions.error', { context: 'duplicate' }),
          placement: 'bottomRight',
        });
        return;
      }
      const newW = await duplicate(workspace);
      if (!newW) return;
      push(`/workspaces/${newW.id}`);
    },
    [duplicate, push, t, workspaces]
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

  return (
    <>
      <Head>
        <title>{t('workspaces.title')}</title>
        <meta name="description" content={t('workspaces.description')} />§
      </Head>
      <Layout
        Header={
          <Header
            leftContent={
              <div className="flex flex-row items-center justify-center">
                <HeaderPopovers />
              </div>
            }
          />
        }
        contentClassName="overflow-y-auto"
        className="max-w-full"
      >
        <div className="mx-32 my-16">
          <div className="bg-info px-14 py-8 rounded-[15px]">
            <div className="text-2xl py-3 font-bold">
              {t('workspaces.welcome.title', {
                name: user && user.firstName,
                context: !user || !user.firstName ? 'noname' : '',
              })}
            </div>
            <div className="text-prisme-darkblue">
              {t('workspaces.welcome.content')}
            </div>
            <div className="text-accent mt-4 text-sm">
              <Trans
                t={t}
                i18nKey="workspaces.welcome.help"
                components={{ a: <a target="_blank" /> }}
              />
            </div>
          </div>

          <div className="pt-6">
            <Input
              type="search"
              value={searchValue}
              onChange={({ target: { value } }) => setSearchValue(value)}
              placeholder={t('workspaces.search')}
              prefix={<SearchOutlined />}
              suffix={
                searchValue && (
                  <CloseOutlined onClick={() => setSearchValue('')} />
                )
              }
              autoFocus
            />
          </div>
          <div className="pt-10">
            <div className="text-xl py-3 font-bold">
              {t('workspaces.suggestions.title')}
            </div>
            <div className="flex flex-wrap -mx-2">
              <CardButton
                onClick={createWorkspace}
                disabled={loading}
                className="p-6 flex border-accent border-dashed bg-ultra-light-accent items-center !justify-start"
              >
                <span className="flex min-w-[50px] bg-accent p-4 rounded">
                  <Image src={plus.src} width={27} height={27} alt="" />
                </span>
                <span className="flex font-bold ml-4 ">
                  {t('create.label', {
                    context: workspaces.size === 0 ? 'first' : '',
                  })}
                </span>
              </CardButton>
              {suggestions.map((workspace) => (
                <WorkspaceCardButton
                  key={workspace.id}
                  workspace={workspace}
                  className="cursor-default"
                >
                  <WorkspaceMenu
                    className="absolute top-2 right-2 invisible group-hover:visible"
                    onDuplicate={duplicateWorkspace(workspace.id)}
                  />
                </WorkspaceCardButton>
              ))}
            </div>
          </div>
          {filtredWorkspacesList.length > 0 && (
            <div className="pt-10 flex flex-col">
              <div className="text-xl py-3 font-bold">
                {t('workspaces.sectionTitle')}
              </div>
              <div className="flex flex-wrap -mx-2">
                {filtredWorkspacesList.map((workspace) => (
                  <WorkspaceCardButton
                    key={workspace.id}
                    workspace={workspace}
                    href={`/workspaces/${workspace.id}`}
                  >
                    <WorkspaceMenu
                      className="absolute top-2 right-2 invisible group-hover:visible"
                      onDuplicate={duplicateWorkspace(workspace.id)}
                    />
                  </WorkspaceCardButton>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-1 right-1 text-gray mr-1 text-[10px]">
          Prisme.ai v{packageJson.version}
        </div>
      </Layout>
    </>
  );
};

export default WorkspacesView;
