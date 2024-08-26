import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Schema,
  schemaTypes,
  Select,
  Tooltip,
  UiOptionsSelect,
  UIWidgetsByType,
} from '@prisme.ai/design-system';
import { Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import LocalizedInput from '../LocalizedInput';
import Enum from './Enum';
import Properties from './Properties';
import UiOptions from './UiOptions';

const WidgetsByType: Record<string, readonly string[]> = {
  ...UIWidgetsByType,
  string: Array.from(
    new Set([...UIWidgetsByType.string.filter((t) => t !== 'select'), 'enum'])
  ),
};

interface SchemaFormBuilderProps {
  value: Schema;
  onChange: (schema: Schema) => void;
}

export const SchemaFormBuilder = ({
  value = {},
  onChange,
}: SchemaFormBuilderProps) => {
  const { t } = useTranslation('common');

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
        if (['enum', 'radio'].includes(v)) {
          newValue.enum = newValue.enum || [];
          newValue.type = 'string';
          if (v === 'radio') {
            newValue['ui:widget'] = 'radio';
          } else {
            delete newValue['ui:widget'];
          }
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

        const hideSearch = v?.['ui:options']?.select?.hideSearch;
        if (typeof hideSearch === 'boolean') {
          newValueWithEnum['ui:options'] = {
            select: {
              hideSearch,
            },
          };
        }

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
    const uiWidget = value['ui:widget'] || (value.enum ? 'enum' : null);

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
        label: t('schemaForm.builder.types.any'),
        value: '',
      },
      ...filteredTypes.map((value) => ({
        label: t(`schemaForm.builder.types.${value.replace(':', '_')}`),
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
          <Tooltip title={t('schemaForm.builder.widget.default_description')}>
            {t('schemaForm.builder.widget.default')}
          </Tooltip>
        ),
        value: '',
      },
      ...filteredWidgets.map((widget) => ({
        label: (
          <Tooltip
            title={t('schemaForm.builder.widget.description', {
              context: widget,
            })}
          >
            {t('schemaForm.builder.widget.name', {
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
      <div className="flex flex-row my-2">
        <div className="flex flex-1 flex-col mr-1">
          <div className="flex flex-row my-2">
            <label className="font-bold">
              {t('schemaForm.builder.property.widget.label')}
            </label>
            <Tooltip
              title={t('schemaForm.builder.property.widget.description')}
              placement="right"
            >
              <button type="button" className="ml-2">
                <InfoCircleOutlined />
              </button>
            </Tooltip>
          </div>
          <Select
            selectOptions={uiWidget || []}
            value={
              value.enum && !value['ui:widget']
                ? 'enum'
                : value['ui:widget'] || ''
            }
            onChange={update('ui:widget')}
          />
        </div>

        <div className="flex flex-1 flex-col ml-1">
          <div className="flex flex-row my-2">
            <label className="font-bold">
              {t('schemaForm.builder.property.type.label')}
            </label>
            <Tooltip
              title={t('schemaForm.builder.property.type.description')}
              placement="right"
            >
              <button type="button" className="ml-2">
                <InfoCircleOutlined />
              </button>
            </Tooltip>
          </div>
          <Select
            selectOptions={options}
            value={value.type || ''}
            onChange={update('type')}
          />
        </div>
      </div>
      {!!value.enum && (
        <div className="flex flex-1 mt-2 pl-4 border-l-[1px] border-gray-200">
          <Enum
            value={{
              ...value,
              'ui:options': {
                select: (value?.['ui:options'] as UiOptionsSelect)
                  ?.select as Omit<UiOptionsSelect['select'], 'options'>,
              },
            }}
            onChange={update('enum')}
          />
        </div>
      )}
      <div>
        <div className="flex flex-row my-2">
          <label className="font-bold">
            {t('schemaForm.builder.property.title')}
          </label>
        </div>
      </div>
      <LocalizedInput value={value.title || ''} onChange={update('title')} />
      <div>
        <div className="flex flex-row my-2">
          <label className="font-bold">
            {t('schemaForm.builder.property.description.label')}
          </label>
          <Tooltip
            title={t('schemaForm.builder.property.description.description')}
            placement="right"
          >
            <button type="button" className="ml-2">
              <InfoCircleOutlined />
            </button>
          </Tooltip>
        </div>
        <LocalizedInput
          value={value.description || ''}
          onChange={update('description')}
        />
      </div>
      {value.type && (
        <div>
          <div className="flex flex-row my-2">
            <label className="font-bold">
              {t('schemaForm.builder.property.placeholder.label')}
            </label>
            <Tooltip
              title={t('schemaForm.builder.property.placeholder.description')}
              placement="right"
            >
              <button type="button" className="ml-2">
                <InfoCircleOutlined />
              </button>
            </Tooltip>
          </div>
          <LocalizedInput
            value={value.placeholder || ''}
            onChange={update('placeholder')}
          />
        </div>
      )}

      {/*
      // Required is not already available
      <label className="flex text-gray my-4">
        <Switch
          checked={!!value.required}
          onChange={(checked) => update('required')(checked)}
          className="!mr-2"
        />
        {t('schemaForm.builder.property.required')}
      </label>*/}
      {value.type === 'array' &&
        !['upload'].includes((value?.['ui:widget'] as string) || '') && (
          <div>
            <div className="flex flex-1 flex-row justify-between items-baseline">
              <div className="mb-4">
                <label className="font-bold">
                  {t('schemaForm.builder.items.label')}
                </label>
                <Tooltip
                  title={t('schemaForm.builder.items.description')}
                  placement="right"
                >
                  <button type="button" className="ml-2">
                    <InfoCircleOutlined />
                  </button>
                </Tooltip>
              </div>
            </div>
            <SchemaFormBuilder
              value={value.items || {}}
              onChange={update('items')}
            />
          </div>
        )}
      {value.type === 'object' && (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-row justify-between items-baseline">
            <div>
              <label className="font-bold">
                {t('schemaForm.builder.properties.label')}
              </label>
              <Tooltip
                title={t('schemaForm.builder.properties.description')}
                placement="right"
              >
                <button type="button" className="ml-2">
                  <InfoCircleOutlined />
                </button>
              </Tooltip>
            </div>
            <Tooltip
              title={t('schemaForm.builder.properties.add')}
              placement="left"
            >
              <Button
                className="-mr-2"
                onClick={() =>
                  onChange({
                    ...value,
                    properties: {
                      ...value.properties,
                      '': {
                        type: 'string',
                      },
                    },
                  })
                }
              >
                <PlusOutlined />
              </Button>
            </Tooltip>
          </div>
          <Properties
            value={value.properties || {}}
            onChange={update('properties')}
          />
        </div>
      )}
      <UiOptions value={value} onChange={onChange} />
    </div>
  );
};

export default SchemaFormBuilder;
