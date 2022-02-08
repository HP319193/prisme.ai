import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import { Button } from '@prisme.ai/design-system';
import Link from 'next/link';

import FullScreen from '../layouts/FullScreen';

export const Home: NextPage = () => {
  const { t } = useTranslation('common');
  return (
    <FullScreen>
      <main className="flex align--center justify-center flex-column">
        <h1 className="flex">{t('main.title')}</h1>
        <Button>
          <Link href="/signin">{t('home.signin')}</Link>
        </Button>
      </main>
    </FullScreen>
  );
};

export default Home;
