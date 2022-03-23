import { LocalizedInput, Select, Switch } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { Schema, types } from '../SchemaForm/types';
import Properties from './Properties';

interface SchemaFormBuilderProps {
  value: Schema;
  onChange: (schema: Schema) => void;
}

export const SchemaFormBuilder = ({
  value,
  onChange,
}: SchemaFormBuilderProps) => {
  const { t } = useTranslation('workspaces');
  const update = useCallback(
    (type: string) => (v: any) => {
      const newValue = { ...value };
      if (type === 'type') {
        if (v !== 'array') {
          delete newValue.items;
        }
        if (v !== 'object') {
          delete newValue.properties;
          delete newValue.additionalProperties;
        }
      }
      onChange({
        ...newValue,
        [type]: v,
      });
    },
    [onChange, value]
  );

  const options = useMemo(
    () =>
      types.map((value) => ({
        label: t(`schema.types.${value}`),
        value,
      })),
    [t]
  );

  return (
    <div className="flex flex-1 flex-col">
      <LocalizedInput
        value={value.title || ''}
        onChange={update('title')}
        InputProps={{
          label: 'title',
        }}
        iconMarginTop={17}
      />
      <LocalizedInput
        value={value.description || ''}
        onChange={update('description')}
        InputProps={{
          label: 'description',
        }}
        iconMarginTop={17}
      />
      <label className="flex text-gray my-4">
        <Switch
          checked={!!value.required}
          onChange={(checked) => update('required')(checked)}
          className="!mr-2"
        />
        Requis
      </label>
      <Select
        selectOptions={options}
        label="type"
        value={value.type}
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
