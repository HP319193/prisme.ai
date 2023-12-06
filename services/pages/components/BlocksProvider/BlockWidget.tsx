import { useBlock } from '@prisme.ai/blocks';
import { InfoBubble, schemaFormUtils } from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import BlockLoader, {
  recursiveConfigContext,
  useRecursiveConfigContext,
} from '../Page/BlockLoader';

export const BlockWidget: FieldComponent = ({
  schema,
  name,
  className,
  label,
}) => {
  const { ['ui:options']: { block: { slug, ...config } } = {} } = schema;
  const { events } = useBlock();
  const field = useField(name);
  const form = useForm();
  const [formValues, setFormValues] = useState({});
  const recursive = useRecursiveConfigContext();

  useEffect(() => {
    // Values are extravcted to be injected in Block inherited config as {{formValues}}
    form.subscribe(
      ({ values }) => {
        setFormValues(values.values);
      },
      {
        values: true,
      }
    );
  }, [form]);

  useEffect(() => {
    if (!config.onChange || !events) return;
    const off = events.on(config.onChange, ({ payload }) => {
      field.input.onChange(payload);
    });
    return () => {
      off();
    };
  }, [config.onChange, events, field.input]);

  const hasError = schemaFormUtils.getError(field.meta);
  const _label =
    label ||
    schema.title ||
    schemaFormUtils.getLabel(field.input.name, schema.title);
  const children =
    label ||
    schema.title ||
    schemaFormUtils.getLabel(field.input.name, schema.title);

  return (
    <div className="pr-form-block">
      {_label && _label !== '' && (
        <label
          className={`${className} pr-form-block__label pr-form-label`}
          htmlFor={field.input.name}
          dangerouslySetInnerHTML={
            typeof children === 'string' ? { __html: children } : undefined
          }
        >
          {typeof children === 'object' ? children : undefined}
        </label>
      )}
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <recursiveConfigContext.Provider value={{ ...recursive, formValues }}>
          <BlockLoader name={slug} config={config} />
        </recursiveConfigContext.Provider>
      </Tooltip>
      <InfoBubble
        className="pr-form-block__description"
        text={schema.description}
      />
    </div>
  );
};

export default BlockWidget;
