import { useBlock } from '@prisme.ai/blocks';
import { InfoBubble, schemaFormUtils } from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { Tooltip } from 'antd';
import { useEffect, useMemo } from 'react';
import { useField } from 'react-final-form';
import BlockLoader from '../Page/BlockLoader';

export const BlockWidget: FieldComponent = ({
  schema,
  name,
  className,
  label,
}) => {
  const { ['ui:options']: { block } = {} } = schema;
  const { events } = useBlock();
  const field = useField(name);

  useEffect(() => {
    if (!block.onChange || !events) return;
    const off = events.on(block.onChange, ({ payload }) => {
      field.input.onChange(payload);
    });
    return () => {
      off();
    };
  }, [block.onChange, events, field.input]);

  const hasError = schemaFormUtils.getError(field.meta);
  const _label =
    label ||
    schema.title ||
    schemaFormUtils.getLabel(field.input.name, schema.title);
  return (
    <div className="pr-form-block">
      {_label && _label !== '' && (
        <label
          className={`${className} pr-form-block__label pr-form-label`}
          htmlFor={field.input.name}
          dangerouslySetInnerHTML={{
            __html:
              label ||
              schema.title ||
              schemaFormUtils.getLabel(field.input.name, schema.title),
          }}
        />
      )}
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <BlockLoader name={block.slug} config={block} />
      </Tooltip>
      <InfoBubble
        className="pr-form-block__description"
        text={schema.description}
      />
    </div>
  );
};

export default BlockWidget;
