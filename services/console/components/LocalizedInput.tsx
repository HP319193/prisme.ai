import { LocalizedInput as LI } from '@prisme.ai/design-system';
import { LocalizedInputProps } from '@prisme.ai/design-system/lib/Components/Localized/LocalizedInput';
import { useTranslation } from 'next-i18next';

export const LocalizedInput = (props: LocalizedInputProps) => {
  const { t } = useTranslation('workspaces');
  return (
    <LI
      {...props}
      availableLangsTitle={t('languages.available.title')}
      setLangsTitle={t('languages.set.title')}
      addLangTooltip={t('languages.add.tooltip', {
        lang: '{{lang}}',
        interpolation: {
          maxReplaces: 0,
        },
      })}
      deleteTooltip={t('languages.delete.tooltip')}
      setLangTooltip={t('languages.set.tooltip')}
    />
  );
};
export default LocalizedInput;
