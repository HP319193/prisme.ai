import { createContext, FC, useContext, useEffect, useState } from 'react';
import api, { Workspace } from '../utils/api';

interface Source {
  name: Workspace['name'];
  description?: Workspace['description'];
  photo?: string;
}

const sourceDetailsContext = createContext<Source>({
  name: '',
});
export const useSourceDetails = () => useContext(sourceDetailsContext);

interface SourceDetailsProps {
  workspaceId?: string;
  appSlug?: string;
}

const sourceCache = new Map<string, Promise<Source> | undefined>();
const fetchWorkspaceDetails = async (workspaceId: string): Promise<Source> => {
  const { name, description, photo } = (await api.getWorkspace(
    workspaceId
  )) || { name: '' };
  return { name, description, photo };
};
const fetchAppDetails = async (appSlug?: string): Promise<Source> => {
  const [{ name = '', description = '', photo = '' } = {}] = (appSlug &&
    (await api.getApps({ query: appSlug }))) || [{}];
  return { name, description, photo };
};

export const SourceDetails: FC<SourceDetailsProps> = ({
  workspaceId,
  appSlug,
  children,
}) => {
  const [details, setDetails] = useState<Source>();

  useEffect(() => {
    if (!workspaceId) return;
    const key = appSlug || workspaceId;
    if (!sourceCache.has(key)) {
      if (appSlug) {
        sourceCache.set(key, fetchAppDetails(appSlug));
      } else {
        sourceCache.set(key, fetchWorkspaceDetails(workspaceId));
      }
    }

    const fetchDetails = async () => {
      const details = await sourceCache.get(key);
      details && setDetails(details);
    };
    fetchDetails();
  }, [appSlug, workspaceId]);

  return (
    <sourceDetailsContext.Provider value={details || ({} as Source)}>
      {children}
    </sourceDetailsContext.Provider>
  );
};

export default SourceDetails;
