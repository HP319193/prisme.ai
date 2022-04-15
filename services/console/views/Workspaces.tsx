import { Button, Layout, Text, Title } from '@prisme.ai/design-system';
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
  const localize = useLocalizedText();

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
      <Layout Header={<Header />}>
        <Title level={3} className="!ml-16 !m-8">
          {t('workspaces.sectionTitle')}
        </Title>
        <div className="!bg-blue-200 flex grow m-16 !mt-0 rounded relative pt-6">
          <div className="flex flex-wrap align-start justify-center gap-4">
            <div className="p-2 bg-slate-100 !m-4 w-[20rem] h-[6rem] flex flex-col justify-between overflow-hidden rounded border border-slate-300 border-dashed">
              <div className="flex grow flex-row text-center content-center">
                <div className="flex mx-3 items-center justify-center">
                  <Button
                    variant="primary"
                    onClick={createWorkspace}
                    disabled={loading}
                    id="createWorkspaceButton"
                    className="!h-12 !w-12 !p-0 !flex items-center justify-center"
                  >
                    <PlusOutlined className="text-[20px]" />
                  </Button>
                </div>
                <div className="flex grow flex-col items-start">
                  <Title level={4}>
                    {t('create.label', {
                      context: workspaces.size === 0 ? 'first' : '',
                    })}
                  </Title>
                  <Text type="grey" className="text-left text-gray">
                    {t('create.description_sub', {
                      context: workspaces.size === 0 ? 'first' : '',
                    })}
                  </Text>
                </div>
              </div>
            </div>
            {workspacesList.map(
              ({ name, id, photo, description, createdBy }) => (
                <div
                  key={id}
                  className="p-2 bg-white !m-4 w-[20rem] h-[6rem] content-center flex flex-col justify-between overflow-hidden rounded border border-gray-200 border-solid"
                >
                  <div className="flex grow flex-row text-center">
                    <div className="flex mx-3">
                      {photo ? (
                        <div className="flex grow items-center justify-center">
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
                      <Text type="grey">
                        {localize(description) ||
                          (user &&
                            user.id === createdBy &&
                            t('workspaces.defaultDescription')) ||
                          ''}
                      </Text>
                      <Link href={`/workspaces/${id}`} key="1">
                        <Button variant="link" className="!p-0">
                          {t('edit.label')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="absolute bottom-0 right-[15px] text-gray mr-1">
            Prisme.ai {packageJson.version}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default WorkspacesView;
