import { Button, DatePicker } from '@prisme.ai/design-system';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import { filters } from './presetFilters';
import ObjectInput from '../ObjectInput';
import moment from 'moment';
import { useQueryString } from '../../providers/QueryStringProvider';
import { Popover } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

type FiltersValue = {
  beforeDate?: moment.Moment;
  afterDate?: moment.Moment;
  fields?: Record<string, string>;
};

function getInitialValue(prevQuery: URLSearchParams) {
  const beforeDate = prevQuery.get('beforeDate');
  const afterDate = prevQuery.get('afterDate');
  const value: FiltersValue = {
    beforeDate: beforeDate ? moment(beforeDate) : undefined,
    afterDate: afterDate ? moment(afterDate) : undefined,
    fields: Array.from(prevQuery.keys()).reduce(
      (prev, k) =>
        ['beforeDate', 'afterDate', 'text'].includes(k)
          ? prev
          : {
              ...prev,
              [k]: prevQuery.get(k),
            },
      {}
    ),
  };
  return value;
}

const Filters = () => {
  const { t } = useTranslation('workspaces');
  const { queryString, setQueryString } = useQueryString();
  const [suggestionsPopupState, setSuggestionsPopupState] = useState(false);
  const fieldsInput = useRef<HTMLDivElement>(null);

  const updateValue = useCallback(
    ({ values }: { values: FiltersValue }) => {
      setQueryString((prevQuery) => {
        const newQuery = new URLSearchParams();
        const text = prevQuery.get('text');
        if (text) {
          newQuery.set('text', text);
        }
        if (values.beforeDate) {
          newQuery.set('beforeDate', values.beforeDate.format());
        }
        if (values.afterDate) {
          newQuery.set('afterDate', values.afterDate.format());
        }
        Object.entries(values.fields || {}).forEach(([k, v]) => {
          newQuery.set(k, v);
        });
        if (newQuery.toString() === prevQuery.toString()) return prevQuery;
        return newQuery;
      });
    },
    [setQueryString]
  );

  const reset = useCallback(() => {
    updateValue({ values: {} });
  }, [updateValue]);

  const builtinFilters = useMemo(
    () =>
      Object.entries(filters).map(([key, filter]) => ({
        value: key,
        label: t('events.filters.suggestions.label', { context: key }),
        filter,
      })),
    [t]
  );

  const focusFieldsInput = useCallback(() => {
    setTimeout(() => {
      if (!fieldsInput.current) return;
      const [, input] = Array.from(
        fieldsInput.current.querySelectorAll('input')
      ).reverse();
      if (!input) return;
      input.focus();
    }, 200);
  }, []);

  return (
    <div className="flex flex-1 px-8">
      <Form onSubmit={updateValue} initialValues={getInitialValue(queryString)}>
        {() => (
          <form className="flex flex-1 flex-col">
            <FormSpy onChange={updateValue}></FormSpy>
            <div className="flex flex-row flex-1 justify-between py-4">
              <div className="flex flex-row">
                <div className="flex mr-4">
                  <Field name="afterDate">
                    {({ input }) => (
                      <label className="flex flex-row items-center">
                        <span className="mr-2">
                          {t('events.filters.afterDate')}
                        </span>
                        <DatePicker
                          showNow={true}
                          showTime={{
                            defaultValue: moment('00:00:00', 'HH:mm:ss'),
                          }}
                          format={'DD/MM/YYYY HH:mm:ss'}
                          {...input}
                        />
                      </label>
                    )}
                  </Field>
                </div>
                <div>
                  <Field name="beforeDate">
                    {({ input }) => (
                      <label className="flex flex-row items-center">
                        <span className="mr-2">
                          {t('events.filters.beforeDate')}
                        </span>
                        <DatePicker
                          showNow={true}
                          showTime={{
                            defaultValue: moment('23:59:59', 'HH:mm:ss'),
                          }}
                          format={'DD/MM/YYYY HH:mm:ss'}
                          {...input}
                        />
                      </label>
                    )}
                  </Field>
                </div>
              </div>
              <div className="flex ">
                <Field name="fields">
                  {({ input }) => (
                    <Button
                      variant="primary"
                      onClick={() => {
                        input.onChange({
                          ...input.value,
                          '': input.value[''] || '',
                        });
                        focusFieldsInput();
                      }}
                    >
                      {t('events.filters.specific.add')}
                    </Button>
                  )}
                </Field>
              </div>
            </div>
            <div className="mb-4 flex flex-row">
              <Button className="!text-xs" onClick={reset}>
                {t('events.filters.reset')}
              </Button>
              <Popover
                onOpenChange={setSuggestionsPopupState}
                open={suggestionsPopupState}
                showArrow
                placement="bottom"
                content={
                  <div className="flex flex-col">
                    {builtinFilters.map(({ label, filter }) => (
                      <Button
                        key={label}
                        onClick={() => {
                          updateValue({
                            values: {
                              fields: filter,
                            },
                          });
                          setSuggestionsPopupState(false);
                        }}
                        icon={<FilterOutlined />}
                        className="!text-left"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                }
                trigger={['click']}
              >
                <Button className="!text-xs">
                  {t('events.filters.suggestions.title')}
                </Button>
              </Popover>
            </div>
            <Field name="fields">
              {({ input }) =>
                input.value &&
                Object.keys(input.value).length > 0 && (
                  <div
                    className="flex flex-1 pt-4 pb-8 border-t"
                    ref={fieldsInput}
                  >
                    <ObjectInput
                      {...input}
                      label={
                        <label className="-mb-2">
                          {t('events.filters.specific.label')}
                        </label>
                      }
                      removeLabel={t('events.filters.specific.remove')}
                      deleteIconClassName="!text-gray"
                    />
                  </div>
                )
              }
            </Field>
          </form>
        )}
      </Form>
    </div>
  );
};

export default Filters;
