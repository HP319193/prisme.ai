import {
  Button,
  FieldProps,
  Popover,
  Schema,
  SchemaForm,
} from '@prisme.ai/design-system';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { useCallback, useMemo, useState } from 'react';
import { CodeEditorInline } from '../CodeEditor/lazy';
import { useField } from 'react-final-form';

const components = {
  FieldAny: ({ name }: FieldProps) => {
    const field = useField(name);
    const [value, setValue] = useState(
      typeof field.input.value === 'string'
        ? field.input.value
        : JSON.stringify(field.input.value, null, '  ')
    );
    const onChange = useCallback(
      (value: string) => {
        setValue(value);
        try {
          const json = JSON.parse(value);
          field.input.onChange(json);
        } catch {
          field.input.onChange(value);
        }
      },
      [field.input]
    );
    return (
      <div className="flex flex-1 mt-5">
        <CodeEditorInline
          value={value}
          onChange={onChange}
          mode="json"
          className="flex flex-1 flex-col"
        />
      </div>
    );
  },
};

const FilterEventsPopover = () => {
  const { t } = useTranslation('workspaces');
  const { updateFilters } = useWorkspace();
  const [filterVisible, setFilterVisible] = useState(false);
  const [values, setValues] = useState<{
    beforeDate?: string;
    afterDate?: string;
  }>({});

  const submit = useCallback(
    (values) => {
      updateFilters(values);
      setFilterVisible(false);
    },
    [updateFilters]
  );

  const schema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        afterDate: {
          type: 'string',
          title: t('events.filters.afterDate'),
          'ui:widget': 'date',
          'ui:options': {
            date: {
              disabledDate: (current) => {
                // Only date before now
                return current.toDate() > new Date();
              },
            },
          },
        },
        beforeDate: {
          type: 'string',
          title: t('events.filters.beforeDate'),
          'ui:widget': 'date',
          'ui:options': {
            date: {
              disabledDate: (current) => {
                // Only date after afterate
                const limit =
                  values && values.afterDate && new Date(values.afterDate);
                return (
                  (limit && current.toDate() < limit) ||
                  current.toDate() > new Date()
                );
              },
            },
          },
        },
        text: {
          type: 'string',
          title: t('events.filters.text'),
        },
      },
      additionalProperties: {},
      'ui:options': {
        grid: [
          [['afterDate', 'beforeDate']],
          [['text']],
          [['additionalProperties']],
        ],
      },
    }),
    [t, values]
  );

  const locales = useMemo(
    () => ({
      submit: t('events.filters.submit'),
      addProperty: t('events.filters.query.label'),
      propertyKey: t('events.filters.query.field'),
    }),
    [t]
  );

  return (
    <Popover
      onVisibleChange={() => setFilterVisible(!filterVisible)}
      content={() => (
        <div className="w-[60vw]">
          <SchemaForm
            schema={schema}
            onSubmit={submit}
            onChange={setValues}
            locales={locales}
            components={components}
          />
        </div>
      )}
      title={t('events.filters.title')}
      visible={filterVisible}
      trigger="click"
    >
      <Button key="filter" onClick={() => setFilterVisible(true)}>
        <FilterOutlined />
        {t('events.filters.title')}
      </Button>
    </Popover>
  );
};

export default FilterEventsPopover;
