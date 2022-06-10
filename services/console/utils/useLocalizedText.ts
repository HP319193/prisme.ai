import { useLocalizedText as useLocalizedDS } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';

const useLocalizedText = (scope = 'workspaces') => {
  const {
    t,
    i18n: { language },
  } = useTranslation(scope);
  const { localize, localizeSchemaForm } = useLocalizedDS(t, language);

  return { localize, localizeSchemaForm };
};

export default useLocalizedText;
