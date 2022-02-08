import { FC } from 'react';

export const SidePanel: FC = ({ children }) => {
  return (
    <div className="border border-gray-200 border-solid grow h-full rounded p-4">
      {children}
    </div>
  );
};

export default SidePanel;
