import { Loading } from '@prisme.ai/design-system';
import { useRouter } from 'next/router';
import { useUser } from '../components/UserProvider';

export const Deploy = () => {
  const { user } = useUser();
  const { replace } = useRouter();
  if (user) {
    replace('/workspaces');
  } else {
    replace('/signup');
  }
  return <Loading />;
};

export default Deploy;
