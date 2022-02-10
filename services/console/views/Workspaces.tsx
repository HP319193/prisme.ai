import { Layout, Button, Text } from '@prisme.ai/design-system';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Workspace } from '../api/types';
import Header from '../components/Header';
import { useWorkspaces } from '../components/WorkspacesProvider';

import CardsContainer from '../layouts/CardsContainer';
import Main from '../layouts/Main';

export const WorkspacesView = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const { workspaces, create } = useWorkspaces();
  const [loading, setLoading] = useState(false);
  const workspacesList = useMemo(
    () => Array.from(workspaces.values()).filter(Boolean) as Workspace[],
    [workspaces]
  );

  workspaces.set('1', {
    id: '1',
    name: 'foo',
    automations: {},
    createdAt: '2021-12-15',
    updatedAt: '2021-12-15',
  });
  workspaces.set('42', {
    id: '42',
    name: 'bar',
    automations: {},
    createdAt: '2021-12-15',
    updatedAt: '2021-12-15',
  });

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
          <CardsContainer className="justify-start">
            {workspacesList.map(({ name, id }) => (
              <Card
                key={id}
                className="!m-8 w-64 h-96 flex flex-col justify-between overflow-hidden"
                actions={[
                  <Link href={`/workspaces/${id}`}>
                    <a>
                      <Button>{t('edit.label')}</Button>
                    </a>
                  </Link>,
                ]}
              >
                <Text>{name}</Text>
              </Card>
            ))}
            <Card
              className="!m-8 w-64 h-96 flex flex-col justify-between overflow-hidden"
              actions={[
                <Button onClick={createWorkspace} disabled={loading}>
                  {t('create.label')}
                </Button>,
              ]}
            >
              {t('create.description', {
                context: workspaces.size === 0 ? 'first' : '',
              })}
            </Card>
          </CardsContainer>
        </div>
      </Layout>
    </>
  );
};

export default WorkspacesView;
