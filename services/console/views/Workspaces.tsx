import { Layout, Button, Text, Space, Title } from '@prisme.ai/design-system';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Workspace } from '../api/types';
import Header from '../components/Header';
import { useWorkspaces } from '../components/WorkspacesProvider';
import icon from '../icons/icon-workspace.svg';

export const WorkspacesView = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const { workspaces, create } = useWorkspaces();
  const [loading, setLoading] = useState(false);
  const workspacesList = useMemo(
    () => Array.from(workspaces.values()).filter(Boolean) as Workspace[],
    [workspaces]
  );

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
        <div className="!bg-blue-200 flex grow m-4 rounded">
          <div className="flex flex-wrap align-start justify-start">
            {workspacesList.map(({ name, id }) => (
              <Card
                key={id}
                className="!m-8 w-64 h-96 flex flex-col justify-between overflow-hidden"
                actions={[
                  <Link href={`/workspaces/${id}`} key="1">
                    <a>
                      <Button>{t('edit.label')}</Button>
                    </a>
                  </Link>,
                ]}
              >
                <div className="flex grow items-center justify-center flex-col text-center">
                  <Space direction="vertical">
                    <Image
                      src={icon}
                      width={48}
                      height={48}
                      className="rounded text-blue"
                      alt={name}
                    />
                    <Title level={4}>{name}</Title>
                    <Text type="grey">
                      {t('workspaces.defaultDescription')}
                    </Text>
                  </Space>
                </div>
              </Card>
            ))}
            <Card className="!m-8 w-64 h-96 flex flex-col justify-between overflow-hidden !bg-transparent !border-2">
              <div className="flex grow items-center justify-between flex-col text-center">
                <div className="flex items-center flex-col text-center mt-20">
                  <Button
                    variant="primary"
                    onClick={createWorkspace}
                    disabled={loading}
                    id="createWorkspaceButton"
                    className="!h-10 !w-10 !p-0 !flex items-center justify-center mb-5"
                  >
                    <PlusOutlined />
                  </Button>
                  <Title level={4}>
                    {t('create.label', {
                      context: workspaces.size === 0 ? 'first' : '',
                    })}
                  </Title>
                </div>
                <Text type="grey">
                  {t('create.description_sub', {
                    context: workspaces.size === 0 ? 'first' : '',
                  })}
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default WorkspacesView;
