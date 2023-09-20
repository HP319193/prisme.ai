import { useEffect } from 'react';
import { useUser } from '../../console/components/UserProvider';

export const Signout = () => {
  const { signout } = useUser();
  useEffect(() => {
    const t = setTimeout(signout, 200);
    return () => {
      clearInterval(t);
    };
  }, [signout]);

  return null;
};

export default Signout;
