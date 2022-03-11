import { Input, Select, Switch } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { FC } from 'react';
import FieldContainer from '../../layouts/Field';
import { useField } from 'react-final-form';
import { CodeEditorInline } from '../CodeEditor/lazy';
import { FieldValidator } from 'final-form';
import { Schema } from './types';
import { InfoCircleOutlined } from '@ant-design/icons';

interface FieldProps {
  field: string;
  type: string;
  description?: string;
  required: boolean;
  oneOf?: Schema['oneOf'];
  widget?: {
    component: string;
    options?: any;
  };
}

export const Field: FC<FieldProps> = ({
  field,
  type,
  description,
  required,
  oneOf,
  widget = {
    component: type,
  },
}) => {
  const { input } = useField(field);
  const validate: FieldValidator<any> = (value) => {
    const isRequired = oneOf
      ? oneOf.every(({ required }) => required.includes(field))
      : required;
    return !value && isRequired ? 'required' : undefined;
  };

  switch (widget.component) {
    case 'object':
      return (
        <FieldContainer
          key={field}
          name={field}
          label={field}
          validate={validate}
        >
          {({ input, className }) => (
            <div>
              <CodeEditorInline mode="json" {...input} className={className} />
            </div>
          )}
        </FieldContainer>
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
          {({ input, className }) => (
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
              {description && (
                <div className="absolute top-[-2px] right-0 text-accent">
                  <Tooltip title={description} placement="left">
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              )}
              <Input
                id={field}
                label={field}
                {...input}
                className={className}
              />
            </div>
          )}
        </FieldContainer>
      );
  }
};
