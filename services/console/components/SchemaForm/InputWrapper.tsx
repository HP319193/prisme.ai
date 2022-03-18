import { Input, LocalizedInput, TextArea } from '@prisme.ai/design-system';
import { LocalizedInputProps } from '@prisme.ai/design-system/lib/Components/LocalizedInput';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

interface InputWrapperProps {
  id: string;
  label: string;
  type: string;
  className: string;
  value: string;
  onChange: LocalizedInputProps['onChange'];
  component?: string;
  componentOptions: any;
  pattern?: string;
}

export const InputWrapper = ({
  component,
  componentOptions = {},
  label,
  pattern,
  ...props
}: InputWrapperProps) => {
  const { t } = useTranslation('workspaces');
  const Component = useMemo(() => {
    switch (component) {
      case 'textarea':
        return TextArea;
      default:
        return Input;
    }
  }, [component]);

  const { localizedText, ...options } = componentOptions;
  if (localizedText) {
    return (
      <LocalizedInput
        {...props}
        Input={Component}
        InputProps={{
          ...options,
          label,
          containerClassName: 'flex flex-1',
          pattern,
        }}
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
        iconMarginTop={17}
      />
    );
  }

  return (
    <Component
      {...props}
      label={label}
      pattern={pattern}
      {...componentOptions}
    />
  );
};

export default InputWrapper;
