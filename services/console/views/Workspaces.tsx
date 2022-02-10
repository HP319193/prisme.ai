import { Layout } from '@prisme.ai/design-system';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
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

  const createWorkspace = useCallback(async () => {
    setLoading(true);
    const { id } = await create(t('create.defaultName'));
    push(`/workspaces/${id}`);
    setLoading(false);
  }, [create, push, t]);

  return (
    <Layout Header={<Header />}>
      <Head>
        <title>{t('workspaces.title')}</title>
        <meta name="description" content={t('workspaces.description')} />
      </Head>
      <CardsContainer className="justify-center">
        {workspacesList.map(({ name, id }) => (
          <Card
            key={id}
            className="w-3 m-2"
            footer={
              <Link href={`/workspaces/${id}`}>
                <a>
                  <Button>{t('edit.label')}</Button>
                </a>
              </Link>
            }
          >
            <Link href={`/workspaces/${id}`}>{name}</Link>
          </Card>
        ))}
        <Card
          className="w-4 m-2"
          footer={
            <Button onClick={createWorkspace} disabled={loading}>
              {t('create.label')}
            </Button>
          }
        >
          {t('create.description', {
            context: workspaces.size === 0 ? 'first' : '',
          })}
        </Card>
      </CardsContainer>
    </Layout>
  );
};

export default WorkspacesView;
