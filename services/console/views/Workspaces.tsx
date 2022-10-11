import {
  Button,
  Input,
  Layout,
  Popover,
  Space,
  Text,
  Title,
  Tooltip,
} from '@prisme.ai/design-system';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';
import Header from '../components/Header';
import { useWorkspaces } from '../components/WorkspacesProvider';
import icon from '../icons/icon-workspace.svg';
import useLocalizedText from '../utils/useLocalizedText';
import { useUser } from '../components/UserProvider';
import plus from '../icons/plus.svg';
import IFrameLoader from '../components/IFrameLoader';
import { removeEmpty, search } from '../utils/filterUtils';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import WorkspaceMenu from '../components/Workspaces/WorkspaceMenu';
import { Workspace } from '../utils/api';

export const WorkspacesView = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');
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
  const { localize } = useLocalizedText();

  const createWorkspace = useCallback(async () => {
    setLoading(true);
    const { id } = await create(t('create.defaultName'));
    push(`/workspaces/${id}`);
    setLoading(false);
  }, [create, push, t]);

  const duplicateWorkspace = useCallback(
    (id: Workspace['id']) => async () => {
      const workspace = workspaces.get(id);
      if (!workspace) return;
      const newW = await duplicate(workspace);
      if (!newW) return;
      push(`/workspaces/${newW.id}`);
    },
    [duplicate, push, workspaces]
  );

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
                <Popover
                  content={() => (
                    <div className="flex h-[75vh] w-[30rem]">
                      <IFrameLoader
                        className="flex flex-1"
                        src={`https://studio.prisme.ai/${language}/pages/I55NTRH`}
                      />
                    </div>
                  )}
                  overlayClassName="pr-full-popover"
                >
                  <Button variant="grey" className="!text-white">
                    <Space>{t('help')}</Space>
                  </Button>
                </Popover>
                <Popover
                  content={() => (
                    <div className="flex h-[75vh] w-[30rem]">
                      <IFrameLoader
                        className="flex flex-1"
                        src={`https://studio.prisme.ai/${language}/pages/xDe6PaQ`}
                      />
                    </div>
                  )}
                  overlayClassName="pr-full-popover"
                >
                  <Button variant="grey" className="!text-white">
                    <Space>{t('whatsNew')}</Space>
                  </Button>
                </Popover>
              </div>
            }
          />
        }
        contentClassName="overflow-y-auto"
      >
        <Title level={3} className="!ml-16 !m-8 !text-lg">
          {t('workspaces.sectionTitle')}
        </Title>
        {workspacesList.length > 1 && (
          <div className="flex mx-16 my-2 !mt-0 rounded relative pt-6">
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
        )}
        <div className="!bg-blue-200 flex flex-1 m-16 !mt-0 rounded relative pt-6">
          <div>
            <div className="flex flex-wrap align-start justify-center gap-4">
              <button
                id="createWorkspaceButton"
                onClick={createWorkspace}
                disabled={loading}
                className="p-2 bg-slate-100 !m-4 w-[21.625rem] h-[7.5rem] flex flex-col justify-between overflow-hidden rounded-[0.938rem] border border-pr-grey border-dashed"
              >
                <div className="flex flex-1 flex-row text-center content-center">
                  <div className="flex ml-3 mr-5 items-center justify-center">
                    <div className="ant-btn ant-btn-primary !h-[4.25rem] !w-[4.25rem] !p-0 !flex items-center justify-center">
                      <Image src={plus.src} width={27} height={27} alt="" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <Title level={4} className="mb-0">
                      {t('create.label', {
                        context: workspaces.size === 0 ? 'first' : '',
                      })}
                    </Title>
                  </div>
                </div>
              </button>
              {filtredWorkspacesList.map(
                ({ name, id, photo, description, createdBy }) => {
                  const descriptionDisplayed =
                    localize(description) ||
                    (user &&
                      user.id === createdBy &&
                      t('workspaces.defaultDescription')) ||
                    '';
                  return (
                    <Link href={`/workspaces/${id}`} key={id}>
                      <a className="relative p-2 bg-white !m-4 w-[21.625rem] h-[7.5rem] content-center flex flex-col justify-between overflow-hidden rounded-[0.938rem] border border-gray-200 border-solid group">
                        <div className="flex flex-1 flex-row text-center max-w-full">
                          <div className="flex ml-3 mr-5">
                            {photo ? (
                              <div className="flex items-center justify-center flex-none">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo}
                                  className="rounded text-blue h-[48px] w-[48px] object-cover"
                                  alt={name}
                                />
                              </div>
                            ) : (
                              <Image
                                src={icon}
                                width={48}
                                height={48}
                                className="rounded text-blue"
                                alt={name}
                              />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col items-start justify-center space-y-2 max-w-[250px]">
                            <Tooltip title={name}>
                              <Title
                                level={4}
                                className="mb-0 max-w-full text-ellipsis overflow-hidden whitespace-nowrap"
                              >
                                {name}
                              </Title>
                            </Tooltip>
                            <Tooltip title={descriptionDisplayed}>
                              <Text
                                type="grey"
                                className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[15rem]"
                              >
                                {descriptionDisplayed}
                              </Text>
                            </Tooltip>
                            <Button variant="link" className="!p-0 !h-[unset]">
                              {t('edit.label')}
                            </Button>
                          </div>
                        </div>
                        <WorkspaceMenu
                          className="absolute top-2 right-2 invisible group-hover:visible"
                          onDuplicate={duplicateWorkspace(id)}
                        />
                      </a>
                    </Link>
                  );
                }
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-1 right-1 text-gray mr-1 text-[10px]">
          Prisme.ai v{packageJson.version}
        </div>
      </Layout>
    </>
  );
};

export default WorkspacesView;
