import {
  Schema,
  SchemaFormDescription,
  schemaTypes,
  Select,
  UIWidgetsByType,
  UIWidgetsForString,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import LocalizedInput from '../LocalizedInput';
import Properties from './Properties';

interface SchemaFormBuilderProps {
  value: Schema;
  onChange: (schema: Schema) => void;
}

export const SchemaFormBuilder = ({
  value = {},
  onChange,
}: SchemaFormBuilderProps) => {
  const { t } = useTranslation('workspaces');
  const update = useCallback(
    (type: string) => (v: any) => {
      let newValue = { ...value };
      if (type === 'type') {
        if (v !== 'array') {
          delete newValue.items;
        }
        if (v !== 'object') {
          delete newValue.properties;
          delete newValue.additionalProperties;
        }

        if (v) {
          newValue.type = v;
        } else {
          delete newValue.type;
        }
        delete newValue['ui:widget'];

        return onChange({
          ...newValue,
        });
      }

      onChange({
        ...newValue,
        [type]: v,
      });
    },
    [onChange, value]
  );

  const options = useMemo(
    () => [
      {
        label: t('schema.types.any'),
        value: '',
      },
      ...schemaTypes.map((value) => ({
        label: t(`schema.types.${value.replace(':', '_')}`),
        value,
      })),
    ],
    [t]
  );

  const uiWidget = useMemo(() => {
    const widgets =
      UIWidgetsByType[
        (value.type || 'string') as keyof typeof UIWidgetsByType
      ] || [];
    if (widgets.length === 0) return null;
    return [
      {
        label: t('schema.widget.default', { context: value.type || 'string' }),
        value: '',
      },
      ...widgets.map((widget) => ({
        label: t('schema.widget.name', {
          context: widget,
        }),
        value: widget,
      })),
    ];
  }, [t, value]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-row">
        <SchemaFormDescription
          className="flex-1"
          text={t('schema.property.type.description')}
        >
          <Select
            selectOptions={options}
            label={t('schema.property.type.label')}
            value={value.type || ''}
            onChange={update('type')}
          />
        </SchemaFormDescription>
        {uiWidget && (
          <SchemaFormDescription
            className="flex-1 ml-2"
            text={t('schema.property.widget.description')}
          >
            <Select
              selectOptions={uiWidget}
              label={t('schema.property.widget.label')}
              value={value['ui:widget'] || ''}
              onChange={update('ui:widget')}
            />
          </SchemaFormDescription>
        )}
      </div>
      <LocalizedInput
        value={value.title || ''}
        onChange={update('title')}
        InputProps={{
          label: t('schema.property.title'),
        }}
        iconMarginTop={17}
      />
      <SchemaFormDescription
        text={t('schema.property.description.description')}
      >
        <LocalizedInput
          value={value.description || ''}
          onChange={update('description')}
          InputProps={{
            label: t('schema.property.description.label'),
          }}
          iconMarginTop={17}
        />
      </SchemaFormDescription>
      {/*
      // Required is not already available
      <label className="flex text-gray my-4">
        <Switch
          checked={!!value.required}
          onChange={(checked) => update('required')(checked)}
          className="!mr-2"
        />
        {t('schema.property.required')}
      </label>*/}
      {value.type === 'array' && (
        <div className="flex flex-1 pl-4 border-l-[1px] border-gray-200">
          <SchemaFormBuilder
            value={value.items || {}}
            onChange={update('items')}
          />
        </div>
      )}
      {value.type === 'object' && (
        <div className="flex flex-1 pl-4 border-l-[1px] border-gray-200">
          <Properties
            value={value.properties || {}}
            onChange={update('properties')}
          />
        </div>
      )}
    </div>
  );
};

export default SchemaFormBuilder;
