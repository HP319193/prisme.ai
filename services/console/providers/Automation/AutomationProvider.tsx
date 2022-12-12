import { Loading } from '@prisme.ai/design-system';
import {
  createContext,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import api from '../../utils/api';
import { useContext } from '../../utils/useContext';

export interface AutomationContext {
  automation: Prismeai.Automation;
  loading: boolean;
  fetchAutomation: () => Promise<Prismeai.Automation | null>;
  saveAutomation: (
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation | null>;
  saving: boolean;
  deleteAutomation: () => Promise<Prismeai.Automation | null>;
}

export const automationContext = createContext<AutomationContext | undefined>(
  undefined
);

export const useAutomation = () =>
  useContext<AutomationContext>(automationContext);

interface AutomationProviderProps {
  workspaceId: string;
  automationSlug: string;
  children: ReactNode;
}

export const AutomationProvider = ({
  workspaceId,
  automationSlug,
  children,
}: AutomationProviderProps) => {
  const [automation, setAutomation] = useState<
    AutomationContext['automation']
  >();
  const [loading, setLoading] = useState<AutomationContext['loading']>(true);
  const [saving, setSaving] = useState<AutomationContext['saving']>(false);

  const fetchAutomation = useCallback(async () => {
    if (!workspaceId || !automationSlug) return null;
    const automation = await api.getAutomation(workspaceId, automationSlug);
    setAutomation(automation);
    return automation || null;
  }, [workspaceId, automationSlug]);

  const saveAutomation: AutomationContext['saveAutomation'] = useCallback(
    async (newAutomation) => {
      if (!workspaceId || !automation) return null;
      setSaving(true);
      const saved = await api.updateAutomation(
        workspaceId,
        automationSlug,
        newAutomation
      );
      setAutomation(saved);
      setSaving(false);
      return saved;
    },
    [automation, automationSlug, workspaceId]
  );

  const deleteAutomation: AutomationContext['deleteAutomation'] = useCallback(async () => {
    if (!workspaceId || !automation) return null;
    setAutomation(undefined);
    api.deleteAutomation(workspaceId, automationSlug);
    return automation;
  }, [automation, automationSlug, workspaceId]);

  useEffect(() => {
    const initAutomation = async () => {
      setLoading(true);
      await fetchAutomation();
      setLoading(false);
    };
    initAutomation();
  }, [fetchAutomation]);

  if (loading) return <Loading />;
  if (!automation) return null;

  return (
    <automationContext.Provider
      value={{
        automation,
        loading,
        fetchAutomation,
        saveAutomation,
        saving,
        deleteAutomation,
      }}
    >
      {children}
    </automationContext.Provider>
  );
};

export default AutomationProvider;
