import { useUser } from '../UserProvider';
export const useProducts = (): {
  href: string;
  name: string;
  icon: string;
}[] => {
  const { user } = useUser();

  return user.meta?.products || [];
};
