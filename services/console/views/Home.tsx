import { NextPage } from 'next';
import { Loading } from '@prisme.ai/design-system';

export const Home: NextPage = () => {
  return (
    <div className="flex grow justify-center align-center min-h-screen">
      <Loading />
    </div>
  );
};

export default Home;
