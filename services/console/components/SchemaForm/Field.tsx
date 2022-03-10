import { Input, Switch } from '@prisme.ai/design-system';
import { FC } from 'react';
import FieldContainer from '../../layouts/Field';
import { useField } from 'react-final-form';
import { CodeEditorInline } from '../CodeEditor/lazy';
import { FieldValidator } from 'final-form';
import { Schema } from './types';

interface FieldProps {
  field: string;
  type: string;
  required: boolean;
  oneOf?: Schema['oneOf'];
}

export const Field: FC<FieldProps> = ({ field, type, required, oneOf }) => {
  const { input } = useField(field);
  const validate: FieldValidator<any> = (value) => {
    const isRequired = oneOf
      ? oneOf.every(({ required }) => required.includes(field))
      : required;
    return !value && isRequired ? 'required' : undefined;
  };
  switch (type) {
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
    case 'string':
    default:
      return (
        <FieldContainer key={field} name={field} validate={validate}>
          {({ input, className }) => (
            <Input id={field} label={field} {...input} className={className} />
          )}
        </FieldContainer>
      );
  }
};
