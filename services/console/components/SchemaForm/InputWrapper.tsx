import { Input, TextArea } from '@prisme.ai/design-system';
import { LocalizedInputProps } from '@prisme.ai/design-system/lib/Components/LocalizedInput';
import { useMemo } from 'react';
import LocalizedInput from '../LocalizedInput';
import { Schema } from './types';

interface InputWrapperProps {
  id: string;
  label: string;
  type: string;
  className: string;
  value: string;
  onChange: LocalizedInputProps['onChange'];
  component?: Schema['ui:widget'];
  componentOptions: Schema['ui:options'];
  pattern?: Schema['pattern'];
}

export const InputWrapper = ({
  component,
  componentOptions = {},
  label,
  pattern,
  type,
  ...props
}: InputWrapperProps) => {
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
          inputType: type,
        }}
        iconMarginTop={17}
      />
    );
  }

  return (
    <Component
      {...props}
      inputType={type}
      label={label}
      pattern={pattern}
      {...componentOptions}
    />
  );
};

export default InputWrapper;
