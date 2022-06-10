import { Layout, Text, Title, Tooltip } from '@prisme.ai/design-system';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';
import { Workspace } from '@prisme.ai/sdk';
import Header from '../components/Header';
import { useWorkspaces } from '../components/WorkspacesProvider';
import icon from '../icons/icon-workspace.svg';
import useLocalizedText from '../utils/useLocalizedText';
import { useUser } from '../components/UserProvider';

export const WorkspacesView = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const { workspaces, create } = useWorkspaces();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const workspacesList = useMemo(
    () =>
      Array.from(workspaces.values()).filter(Boolean) as (Workspace & {
        createdBy: string;
      })[],
    [workspaces]
  );
  const { localize } = useLocalizedText();

  const createWorkspace = useCallback(async () => {
    setLoading(true);
    const { id } = await create(t('create.defaultName'));
    push(`/workspaces/${id}`);
    setLoading(false);
  }, [create, push, t]);

  return (
    <>
      <Head>
        <title>{t('workspaces.title')}</title>
        <meta name="description" content={t('workspaces.description')} />§
      </Head>
      <Layout Header={<Header />} contentClassName="overflow-y-auto">
        <Title level={3} className="!ml-16 !m-8">
          {t('workspaces.sectionTitle')}
        </Title>
        <div className="!bg-blue-200 flex grow m-16 !mt-0 rounded relative pt-6">
          <div>
            <div className="flex flex-wrap align-start justify-center gap-4">
              <button
                id="createWorkspaceButton"
                onClick={createWorkspace}
                disabled={loading}
                className="p-2 bg-slate-100 !m-4 w-[20rem] h-[6rem] flex flex-col justify-between overflow-hidden rounded border border-slate-300 border-dashed"
              >
                <div className="flex grow flex-row text-center content-center">
                  <div className="flex mx-3 items-center justify-center">
                    <div className="ant-btn ant-btn-primary !h-12 !w-12 !p-0 !flex items-center justify-center">
                      <PlusOutlined className="text-[20px]" />
                    </div>
                  </div>
                  <div className="flex grow flex-col justify-center">
                    <Title level={4}>
                      {t('create.label', {
                        context: workspaces.size === 0 ? 'first' : '',
                      })}
                    </Title>
                  </div>
                </div>
              </button>
              {workspacesList.map(
                ({ name, id, photo, description, createdBy }) => {
                  const descriptionDisplayed =
                    localize(description) ||
                    (user &&
                      user.id === createdBy &&
                      t('workspaces.defaultDescription')) ||
                    '';
                  return (
                    <Link href={`/workspaces/${id}`} key={id}>
                      <button className="p-2 bg-white !m-4 w-[20rem] h-[6rem] content-center flex flex-col justify-between overflow-hidden rounded border border-gray-200 border-solid">
                        <div className="flex grow flex-row text-center">
                          <div className="flex mx-3">
                            {photo ? (
                              <div className="flex grow items-center justify-center flex-none">
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
                          <div className="flex grow flex-col items-start">
                            <Title level={4}>{name}</Title>
                            <Tooltip title={descriptionDisplayed}>
                              <Text
                                type="grey"
                                className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[15rem]"
                              >
                                {descriptionDisplayed}
                              </Text>
                            </Tooltip>
                            <div className="ant-btn ant-btn-link !p-0">
                              {t('edit.label')}
                            </div>
                          </div>
                        </div>
                      </button>
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
