import {
  Schema,
  schemaTypes,
  Select,
  UIWidgets,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import LocalizedInput from '../LocalizedInput';
import Properties from './Properties';

const UIWIDGET_DEFAULTS: Record<string, any> = {
  upload: {
    type: 'string',
  },
  textarea: {
    type: 'string',
  },
}; // not yet implemented: select, date, textarea

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

        if (Object.keys(UIWIDGET_DEFAULTS).includes(v)) {
          newValue = {
            ...newValue,
            ...UIWIDGET_DEFAULTS[v],
            'ui:widget': v,
          };
        } else {
          newValue.type = v;
          delete newValue['ui:widget'];
        }

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
      ...schemaTypes.map((value) => ({
        label: t(`schema.types.${value.replace(':', '_')}`),
        value,
      })),
      {
        label: t('schema.types.textarea'),
        value: 'textarea',
      },
      {
        label: t('schema.types.upload'),
        value: 'upload',
      },
    ],
    [t]
  );

  const selectedValue = useMemo(() => {
    if (
      Object.keys(UIWIDGET_DEFAULTS).includes(value['ui:widget'] as UIWidgets)
    ) {
      return value['ui:widget'];
    }

    return value.type;
  }, [value]);

  return (
    <div className="flex flex-1 flex-col">
      <LocalizedInput
        value={value.title || ''}
        onChange={update('title')}
        InputProps={{
          label: t('schema.property.title'),
        }}
        iconMarginTop={17}
      />
      <LocalizedInput
        value={value.description || ''}
        onChange={update('description')}
        InputProps={{
          label: t('schema.property.description'),
        }}
        iconMarginTop={17}
      />
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
      <Select
        selectOptions={options}
        label="type"
        value={selectedValue}
        onChange={update('type')}
      />
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
