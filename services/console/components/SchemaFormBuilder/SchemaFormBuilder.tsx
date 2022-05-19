import {
  Schema,
  SchemaFormDescription,
  schemaTypes,
  Select,
  UIWidgetsByType,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import LocalizedInput from '../LocalizedInput';
import Enum from './Enum';
import Properties from './Properties';

const WidgetsByType = {
  ...UIWidgetsByType,
  string: Array.from(new Set([...UIWidgetsByType.string, 'enum'])),
};

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

      if (type === 'ui:widget') {
        const newValue = { ...value };
        if (v === 'enum') {
          newValue.enum = newValue.enum || [];
          newValue.type = 'string';
          delete newValue['ui:widget'];
        } else {
          delete newValue.enum;
          newValue['ui:widget'] = v;
          if (
            newValue.type &&
            v &&
            !(
              WidgetsByType[newValue.type as keyof typeof WidgetsByType] || []
            ).includes(v)
          ) {
            delete newValue.type;
          }
        }

        return onChange(newValue);
      }

      if (type === 'enum') {
        const newValueWithEnum = {
          ...newValue,
          enum: v.enum,
          enumNames: v.enumNames,
        };
        if (!newValueWithEnum.enum) {
          delete newValueWithEnum.enum;
        }
        if (!newValueWithEnum.enumNames) {
          delete newValueWithEnum.enumNames;
        }

        return onChange(newValueWithEnum);
      }

      onChange({
        ...newValue,
        [type]: v,
      });
    },
    [onChange, value]
  );

  const options = useMemo(() => {
    const uiWidget = value['ui:widget'];

    const uiWidgetIsSet = !!(uiWidget && typeof uiWidget === 'string');
    const filteredTypes = uiWidgetIsSet
      ? Object.keys(WidgetsByType).flatMap((type) =>
          WidgetsByType[type as keyof typeof WidgetsByType].includes(uiWidget)
            ? [type]
            : []
        )
      : schemaTypes;

    return [
      {
        label: t('schema.types.any'),
        value: '',
      },
      ...filteredTypes.map((value) => ({
        label: t(`schema.types.${value.replace(':', '_')}`),
        value,
      })),
    ];
  }, [t, value]);

  const uiWidget = useMemo(() => {
    const filteredWidgets = value.type
      ? WidgetsByType[value.type as keyof typeof WidgetsByType] || []
      : Array.from(
          new Set(Object.values(WidgetsByType).flatMap((widgets) => widgets))
        );

    return [
      {
        label: (
          <Tooltip title={t('schema.widget.default_description')}>
            {t('schema.widget.default')}
          </Tooltip>
        ),
        value: '',
      },
      ...filteredWidgets.map((widget) => ({
        label: (
          <Tooltip
            title={t('schema.widget.description', {
              context: widget,
            })}
          >
            {t('schema.widget.name', {
              context: widget,
            })}
          </Tooltip>
        ),
        value: widget,
      })),
    ];
  }, [t, value]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-row">
        <SchemaFormDescription
          className="flex-1 mr-2"
          text={t('schema.property.widget.description')}
        >
          <Select
            selectOptions={uiWidget || []}
            label={t('schema.property.widget.label')}
            value={value.enum ? 'enum' : value['ui:widget'] || ''}
            onChange={update('ui:widget')}
          />
        </SchemaFormDescription>

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
      </div>
      {!!value.enum && (
        <div className="flex flex-1 mt-2 pl-4 border-l-[1px] border-gray-200">
          <Enum value={value} onChange={update('enum')} />
        </div>
      )}
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
