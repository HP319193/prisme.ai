import { useBlock } from '@prisme.ai/blocks';
import { SchemaForm as OriginalSchemaForm } from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { useEffect } from 'react';
import { useField } from 'react-final-form';
import RichTextEditor from '../../../console/components/RichTextEditor';
import BlockLoader from '../Page/BlockLoader';

const BlockWidget: FieldComponent = ({ schema, name }) => {
  const {
    ['ui:options']: { block: { slug, onChange, ...config } } = {},
  } = schema;
  const { events } = useBlock();
  const field = useField(name);

  useEffect(() => {
    if (!onChange || !events) return;
    const off = events.on(onChange, ({ payload }) => {
      field.input.onChange(payload);
    });
    return () => {
      off();
    };
  }, [onChange, events, field.input]);

  return <BlockLoader name={slug} config={config} />;
};

const components = {
  HTMLEditor: RichTextEditor,
  UiWidgets: {
    block: BlockWidget,
  },
};

export const SchemaForm = ({
  ...props
}: Parameters<typeof OriginalSchemaForm>[0]) => {
  return <OriginalSchemaForm {...props} components={components} />;
};

export default SchemaForm;
