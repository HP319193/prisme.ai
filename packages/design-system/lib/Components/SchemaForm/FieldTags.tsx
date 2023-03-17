import { useCallback, useMemo } from 'react';
import { useField } from 'react-final-form';
import { Tag } from 'antd';
import Select, { TagsOption } from '../Select';
import { FieldProps, Schema, UiOptionsTags } from './types';
import { Label } from './Label';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';

function isUiOptionsTags(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsTags {
  return !!uiOptions && !!(uiOptions as UiOptionsTags).tags;
}

export const FieldTags = (props: FieldProps & { options?: TagsOption }) => {
  const field = useField(props.name);
  const { 'ui:options': uiOptions } = props.schema;
  if (!isUiOptionsTags(uiOptions)) return null;

  const filterOption = useCallback(
    (input, option) =>
      `${option?.label || ''} ${option?.value || ''}`
        .toLowerCase()
        .includes(input.toLowerCase()),
    []
  );

  const tagRender = useMemo(
    () =>
      (
        props: TagsOption & {
          closable: boolean;
          onClose: (e: any) => void;
        }
      ) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (
          event: React.MouseEvent<HTMLSpanElement>
        ) => {
          event.preventDefault();
          event.stopPropagation();
        };

        // The color is not sent as props to the tagRender, so we need to find the matching element manually
        const currentOption = uiOptions.tags.options.find(
          (option) => option.value === value && option.label === option.label
        );

        return (
          <Tag
            color={currentOption?.color}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
          >
            {label}
          </Tag>
        );
      },
    [uiOptions?.tags?.options]
  );

  return (
    <FieldContainer {...props} className="pr-form-tags">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-tags__label pr-form-label"
      >
        {props.label}
      </Label>
      <Select
        mode={uiOptions.tags.allowNew ? 'tags' : 'multiple'}
        selectOptions={uiOptions.tags.options}
        value={field.input.value}
        onChange={field.input.onChange}
        id={field.input.name}
        className="pr-form-tags__input pr-form-input"
        placeholder={props.schema.placeholder || ''}
        showSearch
        filterOption={filterOption}
        tagRender={tagRender}
      />
      <InfoBubble
        className="pr-form-tags__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

export default FieldTags;
