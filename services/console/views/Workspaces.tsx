import { Input, Layout, Loading, notification } from '@prisme.ai/design-system';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation, Trans } from 'react-i18next';
import packageJson from '../../../package.json';
import Header from '../components/Header';
import { useWorkspaces } from '../providers/Workspaces';
import { useUser } from '../components/UserProvider';
import plus from '../icons/plus.svg';
import { removeEmpty, search } from '../utils/filterUtils';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import WorkspaceMenu from '../components/Workspaces/WorkspaceMenu';
import { Workspace } from '../utils/api';
import HeaderPopovers from './HeaderPopovers';
import CardButton from '../components/Workspaces/CardButton';
import WorkspaceCardButton from '../components/Workspaces/WorkspaceCardButton';
import getConfig from 'next/config';
import FadeScroll from '../components/FadeScroll';
import MagnifierIcon from '../icons/magnifier.svgr';
import { incrementName } from '../utils/incrementName';

const {
  publicRuntimeConfig: { SUGGESTIONS_ENDPOINT = '' },
} = getConfig();

export const WorkspacesView = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const {
    workspaces,
    loading,
    creating,
    fetchWorkspaces,
    createWorkspace,
    duplicateWorkspace,
    duplicating,
  } = useWorkspaces();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const { user } = useUser();
  const [searchValue, setSearchValue] = useState('');
  const workspacesList = useMemo(
    () => Array.from(workspaces.values()).filter(removeEmpty),
    [workspaces]
  );
  const filtredWorkspacesList = useMemo(
    () =>
      workspacesList
        .sort(
          ({ updatedAt: A = 0 }, { updatedAt: B = 0 }) =>
            +new Date(B) - +new Date(A)
        )
        .filter(({ name, description }) =>
          search(searchValue)(`${name} ${description}`)
        ),
    [searchValue, workspacesList]
  );

  const handleCreateWorkspace = useCallback(async () => {
    const { id } = await createWorkspace(
      incrementName(
        t('create.defaultName'),
        workspaces.map(({ name }) => name)
      )
    );
    push(`/workspaces/${id}`);
  }, [createWorkspace, push, t, workspaces]);

  const handleDuplicateWorkspace = useCallback(
    (id: Workspace['id']) => async () => {
      const workspace = await duplicateWorkspace(id);
      if (!workspace) return;
      push(`/workspaces/${workspace.id}`);
    },
    [duplicateWorkspace, push]
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

  const filtredSuggestions = useMemo(
    () =>
      suggestions.filter(({ name, description }) =>
        search(searchValue)(`${name} ${description}`)
      ),
    [searchValue, suggestions]
  );

  const ref = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number>();
  useLayoutEffect(() => {
    const listener = () => {
      setCardWidth(ref.current?.getBoundingClientRect()?.width);
    };
    window.addEventListener('resize', listener);
    listener();
    return () => {
      window.removeEventListener('resize', listener);
    };
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
        <div className="mx-4 md:mx-8 lg:mx-32 my-4 md:my-8 lg:my-16">
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
              prefix={
                <MagnifierIcon
                  width="1rem"
                  height="1rem"
                  className="text-gray"
                />
              }
              suffix={
                searchValue && (
                  <CloseOutlined onClick={() => setSearchValue('')} />
                )
              }
              autoFocus
            />
          </div>
          <div className="pt-10 onboarding-step-2">
            <div className="text-xl py-3 font-bold">
              {t('workspaces.suggestions.title')}
            </div>
            <div className="flex flex-nowrap -mx-2 sm:flex-col md:flex-row">
              <CardButton
                onClick={handleCreateWorkspace}
                disabled={creating}
                className="p-6 flex border-accent border-dashed bg-ultra-light-accent items-center !justify-start onboarding-step-3"
                ref={ref}
              >
                <span className="flex min-w-[50px] bg-accent p-4 rounded items-center justify-center">
                  {creating ? (
                    <LoadingOutlined className="text-3xl !text-white" />
                  ) : (
                    <Image src={plus.src} width={24} height={24} alt="" />
                  )}
                </span>
                <span className="flex font-bold ml-4 ">
                  {t('create.label', {
                    context: workspaces.length === 0 ? 'first' : '',
                  })}
                </span>
              </CardButton>
              <FadeScroll
                className="flex-1 pb-4 -mb-4"
                navPosition="calc(50% - 20px)"
              >
                {filtredSuggestions.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex"
                    style={{ minWidth: cardWidth && `${cardWidth}px` }}
                  >
                    <WorkspaceCardButton
                      workspace={workspace}
                      className="cursor-default"
                      containerClassName="flex flex-1 w-[100%] md:w-[100%] lg:w-[100%] xl:w-[100%]"
                    >
                      <WorkspaceMenu
                        className="absolute top-2 right-2 invisible group-hover:visible"
                        onDuplicate={handleDuplicateWorkspace(workspace.id)}
                      />
                    </WorkspaceCardButton>
                  </div>
                ))}
              </FadeScroll>
            </div>
          </div>
          {loading && (
            <div className="pt-24 flex flex-col">
              <Loading />
            </div>
          )}
          {!loading && filtredWorkspacesList.length > 0 && (
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
                      onDuplicate={handleDuplicateWorkspace(workspace.id)}
                      duplicating={duplicating.has(workspace.id)}
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
