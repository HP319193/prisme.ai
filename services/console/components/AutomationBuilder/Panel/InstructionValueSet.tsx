import {
  FieldProps,
  InfoBubble,
  SchemaForm,
  SchemaFormProps,
} from '@prisme.ai/design-system';
import { useEffect, useMemo } from 'react';
import Selector from '../../SchemaForm/BlockSelector/Selector';
import {
  BlockSelectorProvider,
  useBlockSelector,
} from '../../SchemaForm/BlockSelector/BlockSelectorProvider';
import { useField } from 'react-final-form';
import { CloseCircleOutlined } from '@ant-design/icons';
import components, { FieldAny } from '../../SchemaForm/schemaFormComponents';
import { useTranslation } from 'next-i18next';
import FieldContainerWithRaw from '../../FieldContainerWithRaw';

export interface InstructionValueSetProps extends SchemaFormProps {}

const InterfaceSelector = (props: FieldProps) => {
  const { selectBlock } = useBlockSelector();
  const { t } = useTranslation('workspaces');
  const field = useField(props.name);

  useEffect(() => {
    selectBlock(field.input.value);
  }, [field.input.value, selectBlock]);

  return (
    <div className="pr-form-field">
      <label htmlFor={`${field.input.name}.name`} className="pr-form-label">
        {t('automations.instruction.form.set.interface.label')}
      </label>
      <div className="pr-form-input relative">
        <Selector
          id={`${field.input.name}.name`}
          {...field.input}
          className="w-full"
        />
        <button
          onClick={() => field.input.onChange(null)}
          className="absolute top-2 right-8"
        >
          <CloseCircleOutlined />
        </button>
      </div>
      <div className="pr-form-description">
        <InfoBubble
          className="pr-form-object__description"
          text={props.schema.description}
        />
      </div>
    </div>
  );
};

const ValueEditor = (props: FieldProps) => {
  const { t } = useTranslation('workspaces');
  const { schema } = useBlockSelector();
  const field = useField(props.name);

  if (schema)
    return (
      <FieldContainerWithRaw {...props}>
        <label htmlFor={`${field.input.name}.name`} className="pr-form-label">
          {t('automations.instruction.form.set.value.label')}
        </label>
        <div className="pr-form-input flex flex-1 -m-4 mt-4">
          <SchemaForm
            schema={schema}
            initialValues={field.input.value}
            onChange={field.input.onChange}
            components={components}
          />
        </div>
        <div className="pr-form-description">
          <InfoBubble text={props.schema.description} />
        </div>
      </FieldContainerWithRaw>
    );
  return <FieldAny {...props} />;
};

export const InstructionValueSet = (props: InstructionValueSetProps) => {
  const schema = useMemo(() => {
    const schema = props.schema;
    schema.properties = schema.properties || {};
    schema.properties.interface['ui:widget'] = InterfaceSelector;

    schema.properties.value['ui:widget'] = ValueEditor;

    return schema;
  }, [props.schema]);

  return (
    <BlockSelectorProvider>
      <SchemaForm {...props} schema={schema} />
    </BlockSelectorProvider>
  );
};
