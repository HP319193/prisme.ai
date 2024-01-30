import Link from 'next/link';
import { ReactNode } from 'react';
import WorkspaceBuilder from '../WorkspaceBuilder/WorkspaceBuilder';
import HistoryKeeper from './HistoryKeeper';

interface UserSpaceProps {
  children: ReactNode;
}

export const UserSpace = ({ children }: UserSpaceProps) => {
  return (
    <div className="flex flex-col flex-1 min-h-full">
      <div className="flex flex-row">UserSpace</div>
      <div className="flex flex-row flex-1">
        <div className="flex flex-col">
          <HistoryKeeper>
            <Link href="/workspaces">Studio</Link>
            <Link href="/product/ai-knowledge-chat">Chat</Link>
          </HistoryKeeper>
        </div>
        <div className="flex flex-col flex-1 relative overflow-hidden">
          {<WorkspaceBuilder>{children}</WorkspaceBuilder>}
        </div>
      </div>
    </div>
  );
};

export default UserSpace;
