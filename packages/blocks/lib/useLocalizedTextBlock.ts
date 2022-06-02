import { useLocalizedText } from '@prisme.ai/design-system';
import { useTranslation } from 'react-i18next';

const useLocalizedTextBlock = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { localize, localizeSchemaForm } = useLocalizedText(t, language);

  return { localize, localizeSchemaForm };
};

export default useLocalizedTextBlock;
