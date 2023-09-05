import { useLocalizedText as useLocalizedDS } from '@prisme.ai/design-system';
import { useTranslation } from 'react-i18next';

const useLocalizedText = () => {
  const {
    t,
    i18n: { language, exists },
  } = useTranslation();
  function enhancedT(key: string) {
    return typeof key === 'string' && exists(key) ? t(key) : key;
  }
  const { localize, localizeSchemaForm } = useLocalizedDS(enhancedT, language);

  return { localize, localizeSchemaForm };
};

export default useLocalizedText;
