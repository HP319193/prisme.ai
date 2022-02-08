import { FC } from 'react';

export const FullScreen: FC = ({ children }) => {
  return (
    <div className="flex justify-center align--center min-h-screen">
      {children}
    </div>
  );
};

export default FullScreen;
