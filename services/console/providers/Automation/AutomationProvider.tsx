import { Loading } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import {
  createContext,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import NotFound from '../../components/NotFound';
import api from '../../utils/api';
import { useContext } from '../../utils/useContext';
import AutomationIconSvg from '../../icons/automation.svgr';
import { QuestionOutlined } from '@ant-design/icons';

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

const LostAutomationIcon = ({ className }: { className?: string }) => {
  return (
    <div className={`relative ${className}`} style={{ width: '100px' }}>
      <AutomationIconSvg />
      <QuestionOutlined
        className="text-4xl"
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
      />
    </div>
  );
};

export const AutomationProvider = ({
  workspaceId,
  automationSlug,
  children,
}: AutomationProviderProps) => {
  const { t } = useTranslation('workspaces');
  const [automation, setAutomation] = useState<
    AutomationContext['automation']
  >();
  const [slug, setSlug] = useState(automationSlug);
  const [loading, setLoading] = useState<AutomationContext['loading']>(true);
  const [saving, setSaving] = useState<AutomationContext['saving']>(false);
  const [notFound, setNotFound] = useState(false);

  const fetchAutomation = useCallback(async () => {
    if (!workspaceId || !automationSlug) return null;
    try {
      setNotFound(false);
      const automation = await api.getAutomation(workspaceId, automationSlug);
      setAutomation(automation);
      return automation || null;
    } catch (e) {
      setNotFound(true);
      return null;
    }
  }, [workspaceId, automationSlug]);

  const saveAutomation: AutomationContext['saveAutomation'] = useCallback(
    async (newAutomation) => {
      if (!workspaceId || !automation) return null;
      setSaving(true);
      const saved = await api.updateAutomation(
        workspaceId,
        slug,
        newAutomation
      );
      if (saved.slug !== slug) {
        setSlug(saved.slug);
      }
      setAutomation(saved);
      setSaving(false);
      return saved;
    },
    [automation, slug, workspaceId]
  );

  const deleteAutomation: AutomationContext['deleteAutomation'] = useCallback(async () => {
    if (!workspaceId || !automation) return null;
    setAutomation(undefined);
    api.deleteAutomation(workspaceId, slug);
    return automation;
  }, [automation, slug, workspaceId]);

  useEffect(() => {
    const initAutomation = async () => {
      setSlug(automationSlug);
      setLoading(true);
      await fetchAutomation();
      setLoading(false);
    };
    initAutomation();
  }, [automationSlug, fetchAutomation]);

  if (loading) return <Loading />;
  if (notFound)
    return (
      <NotFound icon={LostAutomationIcon} text={t('automations.notFound')} />
    );
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
