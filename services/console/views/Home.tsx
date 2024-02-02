import { NextPage } from 'next';
import { Loading } from '@prisme.ai/design-system';
import { useRouter } from 'next/router';

export const Home: NextPage = () => {
  const { replace } = useRouter();
  replace('/products');
  return (
    <div className="flex flex-1 justify-center items-center min-h-screen">
      <Loading />
    </div>
  );
};

export default Home;
