import { Collapse, Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import SliderOptions from './SliderOptions';
import TagsOptions from './TagsOptions';
import UploadOptions from './UploadOptions';

interface UiOptionsProps {
  value: Schema;
  onChange: (schema: Schema) => void;
}

const WidgetsWithOptions = ['slider', 'tags', 'upload'];

const getOptionsForm = (widget: typeof WidgetsWithOptions[number]) => {
  switch (widget) {
    case 'slider':
      return SliderOptions;
    case 'tags':
      return TagsOptions;
    case 'upload':
      return UploadOptions;
  }
};

export const UiOptions = ({ value, onChange }: UiOptionsProps) => {
  const { t } = useTranslation('common');
  const widget = value?.['ui:widget'];
  const hasOptions =
    widget && typeof widget === 'string' && WidgetsWithOptions.includes(widget);

  const items = useMemo(() => {
    if (!widget || !hasOptions) return null;
    const Component = getOptionsForm(widget);
    if (!Component) return null;
    return [
      {
        label: t('schemaForm.builder.uiOptions.label'),
        content: (
          <Component
            value={value['ui:options'] || {}}
            onChange={(newValue) => {
              onChange({
                ...value,
                ['ui:options']: newValue,
              });
            }}
          />
        ),
      },
    ];
  }, [hasOptions, onChange, t, value, widget]);

  if (!hasOptions || !items) return null;

  return <Collapse items={items} />;
};

export default UiOptions;
