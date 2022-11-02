import {
  Button,
  Popover,
  FieldProps,
  Schema,
  SchemaForm,
  Tooltip,
} from '@prisme.ai/design-system';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CodeEditorInline } from '../CodeEditor/lazy';
import { useField } from 'react-final-form';
import { useWorkspace } from '../WorkspaceProvider';
import { filters } from './filters';

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

type FiltersValue = Record<string, string> & {
  beforeDate?: string;
  afterDate?: string;
  text?: string;
};

const FilterEventsPopover = () => {
  const { t } = useTranslation('workspaces');
  const { updateFilters } = useWorkspace();
  const [filterVisible, setFilterVisible] = useState(false);
  const [values, setValues] = useState<FiltersValue>({});

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
              showNow: true,
              showTime: true,
              format: 'DD/MM/YYYY HH:mm:ss',
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
              showNow: true,
              showTime: true,
              format: 'DD/MM/YYYY HH:mm:ss',
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

  const builtinFilters = useMemo(
    () =>
      Object.entries(filters).map(([key, filter]) => ({
        value: key,
        label: t('events.filters.suggestions.label', { context: key }),
        filter,
      })),
    [t]
  );
  const [mountedForm, setMountedForm] = useState(true);
  useEffect(() => {
    if (!mountedForm) {
      setMountedForm(true);
    }
  }, [mountedForm]);
  const [suggestionsPopupState, setSuggestionsPopupState] = useState(false);

  return (
    <Popover
      onVisibleChange={() => setFilterVisible(!filterVisible)}
      content={() => (
        <div className="w-[60vw]">
          {mountedForm && (
            <SchemaForm
              schema={schema}
              onSubmit={submit}
              onChange={setValues}
              locales={locales}
              components={components}
              initialValues={values}
            />
          )}
        </div>
      )}
      title={
        <div className="flex flex-1">
          <div className="flex-1">{t('events.filters.title')}</div>
          <div className="flex">
            <Popover
              title={t('events.filters.suggestions.title')}
              placement="bottom"
              titleClassName="!p-4"
              onOpenChange={setSuggestionsPopupState}
              open={suggestionsPopupState}
              content={() => (
                <div>
                  {builtinFilters.map(({ label, filter }) => (
                    <Button
                      key={label}
                      onClick={() => {
                        setValues(filter || {});
                        setMountedForm(false);
                        setSuggestionsPopupState(false);
                      }}
                      icon={<FilterOutlined />}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
            >
              <Button>
                <Tooltip
                  title={t('events.filters.suggestions.help')}
                  placement="left"
                >
                  <div className="relative">
                    <SearchOutlined className="text-2xl" />
                    <FilterOutlined className="absolute text-sm -top-1 -left-2" />
                  </div>
                </Tooltip>
              </Button>
            </Popover>
          </div>
        </div>
      }
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
