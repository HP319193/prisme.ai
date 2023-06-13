import { Loading } from '@prisme.ai/design-system';
import { useRouter } from 'next/router';
import QueryString from 'qs';
import { useUser } from '../components/UserProvider';
import Storage from '../utils/Storage';

export const Deploy = () => {
  const { user } = useUser();
  const {
    replace,
    query: { wId },
  } = useRouter();
  if (wId) {
    Storage.set('__install', wId);
  }
  if (typeof window !== 'undefined' && window.location.search) {
    const qs = QueryString.parse(window.location.search.replace(/^\?/, ''));
    if (qs.email) {
      Storage.set('__email', qs.email);
    }
  }
  if (user) {
    replace('/workspaces');
  } else {
    replace('/signup');
  }
  return <Loading />;
};

export default Deploy;
