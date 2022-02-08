import Link from 'next/link';
import { Button } from 'primereact/button';
import { FC, ReactNode } from 'react';
import Loading from '../components/Loading';
import { useUser } from '../components/UserProvider';
import Toaster from './Toaster';

interface MainProps {
  title?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}
export const Main: FC<MainProps> = ({
  children,
  title,
  leftContent,
  rightContent,
}) => {
  const { user, loading, signout } = useUser();

  if (!user && loading) {
    return (
      <div className="flex min-h-screen max-h-screen flex-column justify-center">
        <Loading className="text-5xl" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-h-screen flex-column">
      <div className="bg-primary p-4 z-1 drop-shadow-md">
        <div className="flex justify-between">
          <div className="flex direction-row align-center">
            <div className="mr-2">
              <Link href="/workspaces">{title || 'Prisme.ai'}</Link>
            </div>
            {leftContent}
          </div>
          <div>
            {rightContent && rightContent}
            <Button icon="pi pi-power-off" onClick={signout} />
          </div>
        </div>
      </div>
      <div
        className="flex flex-1 surface-ground relative"
        style={{ overflow: 'auto', overflowX: 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
};

export default Main;
