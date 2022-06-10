import { useLocalizedText as useLocalizedDS } from '@prisme.ai/design-system';
import { useTranslation } from 'react-i18next';

const useLocalizedText = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { localize, localizeSchemaForm } = useLocalizedDS(t, language);

  return { localize, localizeSchemaForm };
};

export default useLocalizedText;
