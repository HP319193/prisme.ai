import { Input, Select, Switch } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { FC } from 'react';
import FieldContainer from '../../layouts/Field';
import { useField } from 'react-final-form';
import { CodeEditorInline } from '../CodeEditor/lazy';
import { FieldValidator } from 'final-form';
import { Schema } from './types';
import {
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { FieldArray } from 'react-final-form-arrays';
import { useTranslation } from 'next-i18next';
import useLocalizedText from '../../utils/useLocalizedText';

const getDefaultValue = (type?: string) => {
  switch (type) {
    case 'object':
      return {};
    case 'array':
      return [];
    case 'string':
    default:
      return '';
  }
};
interface FieldProps {
  field: string;
  type: string;
  title?: string | null;
  description?: string;
  items?: FieldProps;
  properties?: Record<string, FieldProps>;
  required: boolean;
  oneOf?: Schema['oneOf'];
  widget?: {
    component?: string;
    options?: any;
  };
}

export const Field: FC<FieldProps> = ({
  field,
  type,
  title = field,
  items,
  properties,
  description,
  required,
  oneOf,
  widget = {
    component: type,
  },
}) => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const { input } = useField(field);
  const validate: FieldValidator<any> = (value) => {
    const isRequired = oneOf
      ? oneOf.every(({ required }) => required.includes(field))
      : required;
    return !value && isRequired ? 'required' : undefined;
  };

  switch (widget.component) {
    case 'array':
      return (
        <FieldArray key={field} name={field} label={title} validate={validate}>
          {({ fields }) => (
            <div className="ml-2 pl-2 border-l-[1px] border-solid border-[gray]">
              <div className="flex flex-1">
                <button
                  type="button"
                  className="text-accent flex flex-1 justify-between"
                  onClick={() =>
                    fields.push(getDefaultValue(items && items.type))
                  }
                >
                  <label className="ml-[3px] text-gray text-[10px]">
                    {title}
                  </label>
                  <div className="flex flex-row items-baseline">
                    {!!description && (
                      <div className="text-accent mr-2">
                        <Tooltip title={localize(description)} placement="left">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </div>
                    )}
                    <Tooltip
                      title={t('automations.instruction.item.add')}
                      placement="left"
                    >
                      <PlusCircleOutlined />
                    </Tooltip>
                  </div>
                </button>
              </div>
              <div className="my-2 ml-2">
                {fields.map((name, index) => (
                  <div key={name} className="relative">
                    <Field
                      title={null}
                      description={items && localize(items.description)}
                      field={name}
                      type={(items && items.type) || 'string'}
                      required={false}
                    />
                    <Tooltip
                      title={t('automations.instruction.item.remove')}
                      placement="left"
                    >
                      <button
                        className={`absolute text-gray ${
                          !items || items.type !== 'array'
                            ? 'right-[5px] top-[20%]'
                            : 'right-[21px] top-[-5px]'
                        }`}
                        type="button"
                        onClick={() => {
                          fields.remove(index);
                        }}
                      >
                        <CloseCircleOutlined />
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FieldArray>
      );
    case 'object':
      const fields = Object.keys(properties || {});

      return (
        <div className="ml-2 pl-2 border-l-[1px] border-[gray] border-solid">
          <label className="text-gray text-[10px]">{title}</label>
          {fields.map((name) => (
            <Field
              key={name}
              {...(properties || {})[name]}
              field={`${field}.${name}`}
            />
          ))}
        </div>
      );
    case 'boolean':
      return (
        <div className="mb-5">
          <label className="mx-2 flex flex-1 align-center">
            <Switch
              checked={input.value}
              onChange={(value) => input.onChange(value)}
              className="!mr-2"
            />
            <div>{field}</div>
          </label>
        </div>
      );
    case 'select':
      return (
        <FieldContainer key={field} name={field} validate={validate}>
          {({ input }) => (
            <Select
              className="flex flex-1 w-full"
              selectOptions={(Array.isArray(widget.options.options)
                ? widget.options.options
                : []
              ).map((item: string | { label: string; value: string }) =>
                typeof item === 'string'
                  ? {
                      label: item,
                      value: item,
                    }
                  : item
              )}
              {...input}
            />
          )}
        </FieldContainer>
      );
    case 'string':
    default:
      return (
        <FieldContainer key={field} name={field} validate={validate}>
          {({ input, className }) => (
            <div className="relative">
              {!!description && (
                <div className="absolute top-[-2px] right-0 text-accent">
                  <Tooltip title={localize(description)} placement="left">
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              )}
              <Input
                id={field}
                label={title || ''}
                {...input}
                className={className}
              />
            </div>
          )}
        </FieldContainer>
      );
  }
};
