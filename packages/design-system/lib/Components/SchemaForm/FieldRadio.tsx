import { Radio } from 'antd';
import { ReactNode } from 'react';
import { FieldInputProps, useField } from 'react-final-form';
import { isSelectGroup, SelectProps } from '../Select';
import FieldContainer from './FieldContainer';
import { useSelectOptions } from './FieldSelect';
import InfoBubble from './InfoBubble';
import { FieldProps } from './types';
import { getLabel } from './utils';

const RadioGroup = ({
  onChange,
  label,
  options,
}: {
  label?: string | ReactNode;
  options: ReturnType<typeof useSelectOptions>;
  onChange: FieldInputProps<any, HTMLElement>['onChange'];
}) => {
  return (
    <>
      <label className="pr-form-radio__label pr-form-label">{label}</label>
      <Radio.Group
        onChange={onChange}
        className="pr-form-radio__input pr-form-input"
      >
        {options?.map((option, k) => {
          if (isSelectGroup(option)) {
            return (
              <RadioGroup
                key={k}
                options={option.options}
                label={option.label}
                onChange={onChange}
              />
            );
          }

          return (
            <Radio key={k} value={option.value}>
              {typeof option.label === 'string' && (
                <span dangerouslySetInnerHTML={{ __html: option.label }} />
              )}
              {typeof option.label !== 'string' && option.label}
            </Radio>
          );
        })}
      </Radio.Group>
    </>
  );
};

export const FieldRadio = (
  props: FieldProps & { options?: SelectProps['selectOptions'] }
) => {
  const field = useField(props.name);
  const selectOptions = useSelectOptions(props.schema, props.options);
  if (!selectOptions) return null;

  return (
    <FieldContainer {...props} className="pr-form-radio">
      <RadioGroup
        label={props.label || props.schema.title || getLabel(props.name)}
        options={selectOptions}
        onChange={field.input.onChange}
      />
      <InfoBubble
        className="pr-form-radio__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldRadio;
