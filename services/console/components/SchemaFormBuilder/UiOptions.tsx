import { Collapse, Schema } from '@prisme.ai/design-system';
import el from 'date-fns/esm/locale/el/index.js';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import SliderOptions from './SliderOptions';
import TagsOptions from './TagsOptions';

interface UiOptionsProps {
  value: Schema;
  onChange: (schema: Schema) => void;
}

const WidgetsWithOptions = ['slider', 'tags'];

const getOptionsForm = (widget: typeof WidgetsWithOptions[number]) => {
  switch (widget) {
    case 'slider':
      return SliderOptions;
    case 'tags':
      return TagsOptions;
  }
};

export const UiOptions = ({ value, onChange }: UiOptionsProps) => {
  const { t } = useTranslation('workspaces');
  const widget = value?.['ui:widget'];
  const hasOptions =
    widget && typeof widget === 'string' && WidgetsWithOptions.includes(widget);

  const items = useMemo(() => {
    if (!widget || !hasOptions) return null;
    const Component = getOptionsForm(widget);
    if (!Component) return null;
    return [
      {
        label: t('schema.uiOptions.label'),
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
