import { useUser } from '../../console/components/UserProvider';

export const Signout = () => {
  const { signout } = useUser();
  signout();
  return null;
};

export default Signout;
