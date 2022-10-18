import { createContext, FC, useContext, useState } from 'react';

interface WorkspaceContext {
  id: string;
  setId: (id: string) => void;
}

export const context = createContext<WorkspaceContext>({
  id: '',
  setId() {},
});

export const useWorkspace = () => useContext(context);

export const WorkspaceProvider: FC = ({ children }) => {
  const [id, setId] = useState('');
  return <context.Provider value={{ id, setId }}>{children}</context.Provider>;
};

export default WorkspaceProvider;
