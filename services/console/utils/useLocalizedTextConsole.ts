import { useLocalizedText } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';

const useLocalizedTextConsole = (scope = 'workspaces') => {
  const {
    t,
    i18n: { language },
  } = useTranslation(scope);
  const { localize, localizeSchemaForm } = useLocalizedText(t, language);

  return { localize, localizeSchemaForm };
};

export default useLocalizedTextConsole;
