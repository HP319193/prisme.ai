import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import { Button } from '@prisme.ai/design-system';
import Link from 'next/link';

export const Home: NextPage = () => {
  const { t } = useTranslation('common');
  return (
    <div className="flex justify-center align-center min-h-screen">
      <main className="flex align-center justify-center flex-col">
        <h1 className="flex">{t('main.title')}</h1>
        <Button>
          <Link href="/signin">{t('home.signin')}</Link>
        </Button>
      </main>
    </div>
  );
};

export default Home;
