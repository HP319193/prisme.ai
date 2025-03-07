import {
  Button,
  Schema,
  SchemaFormProps,
  UiOptionsCommon,
} from '@prisme.ai/design-system';
import { BlockContext, useBlock } from '../Provider';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useLocalizedText from '../useLocalizedText';
import {
  BlocksDependenciesContext,
  useBlocks,
} from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { Action, ActionConfig } from './Action';
import get from 'lodash.get';
import getFieldFromValuePath from '../utils/getFieldFromValuePath';

const defaultSchema = {};

interface FormConfig extends BaseBlockConfig {
  title?: Prismeai.LocalizedText;
  schema: Schema;
  onChange?:
    | string
    | {
        event: string;
        payload?: Record<string, any>;
      };
  onSubmit?:
    | string
    | {
        event: string;
        payload?: Record<string, any>;
      };
  submitLabel?: string;
  hideSubmit?: boolean;
  disabledSubmit?: boolean;
  disableSubmitDelay?: number;
  values?: Record<string, any>;
  buttons?: ActionConfig[];
  collapsed?: boolean;
  autoFocus?: boolean;
}

interface FormProps extends FormConfig {
  events: BlockContext['events'];
  SchemaForm: BlocksDependenciesContext['components']['SchemaForm'];
  Link: BlocksDependenciesContext['components']['Link'];
  uploadFile: BlocksDependenciesContext['utils']['uploadFile'];
}

function isCommonOptions(
  options: Schema['ui:options']
): options is UiOptionsCommon {
  return !!(options as UiOptionsCommon).field;
}

export const Form = ({
  events,
  SchemaForm,
  Link,
  uploadFile,
  className,
  buttons,
  sectionId = '',
  autoFocus,
  ...config
}: FormProps) => {
  const { t } = useTranslation();
  const { localize, localizeSchemaForm } = useLocalizedText();
  const [initialValues] = useState(config.values || {});
  const canChange = useRef(true);
  const formRef: SchemaFormProps['formRef'] = useRef<any>();
  const containerEl = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [values, setValues] = useState<Record<string, any> | undefined>(
    initialValues
  );

  useEffect(
    () =>
      setHasError(
        Object.keys(formRef?.current?.getState().errors || {}).length > 0
      ),
    []
  );

  useEffect(() => {
    setValues(config.values);
  }, [config.values]);

  const mergeValuesWithPayload = useCallback(
    (values: any = {}, payload?: any) => {
      if (values && typeof values !== 'object') {
        return values;
      }
      // This is to delete values in payload if the value in form with same key is unset
      formRef.current.getRegisteredFields().forEach((field) => {
        const realField = field.replace('values.', '');
        payload[realField] = values[realField];
      });
      return { ...payload, ...values };
    },
    []
  );

  const onChange = useCallback(
    (values: any) => {
      setValues(values);
      if (!config.onChange || !events) return;
      const { event, payload = {} } =
        typeof config.onChange === 'string'
          ? { event: config.onChange }
          : config.onChange;
      events.emit(event, mergeValuesWithPayload(values, payload));
    },
    [config.onChange, events]
  );

  useEffect(() => {
    const update = async () => {
      const form = formRef?.current;
      if (!form) return;
      canChange.current = false;
      const fields = form.getRegisteredFields();
      await fields
        .filter((field) => field !== 'values')
        .filter((field) => {
          const schema = getFieldFromValuePath(
            { properties: { values: config.schema } },
            field
          );
          if (!schema) return true;
          const { 'ui:options': options } = schema;
          if (!options || !isCommonOptions(options)) return true;
          if (options.field.updateValue === false) return false;
          if (options.field.updateValue === 'blur') {
            const { active } = form.getFieldState(field) || {};
            return !active;
          }
          return true;
        })
        .forEach((name) => {
          const field = form.getFieldState(name);
          if (!field) return;
          const newValue = get({ values: config.values }, name);
          if (newValue === undefined) return;
          if (field.value !== newValue) {
            form.change(name, newValue);
          }
        });
      canChange.current = true;
    };
    update();
  }, [config.values]);

  const disabledSubmit = useRef(false);
  const onSubmit = useCallback(
    (values: any) => {
      if (disabledSubmit.current || !config.onSubmit || !events) return;
      const { event, payload = {} } =
        typeof config.onSubmit === 'string'
          ? { event: config.onSubmit }
          : config.onSubmit;
      disabledSubmit.current = true;
      setTimeout(
        () => (disabledSubmit.current = false),
        +(config.disableSubmitDelay || 1000)
      );
      events.emit(event, mergeValuesWithPayload(values, payload));
    },
    [config.onSubmit, events]
  );

  const localizedSchema = useMemo(() => {
    return localizeSchemaForm(config.schema || defaultSchema);
  }, [config.schema, localizeSchemaForm]);

  const customButtons = useMemo(
    () =>
      (buttons || []).map((button, key) => {
        const payload = { values, ...button.payload };
        return (
          <Action
            key={key}
            {...button}
            className={`pr-block-form__button ${button.className || ''}`}
            payload={payload}
            events={events}
            Link={Link}
          />
        );
      }),
    [buttons, events, Link, values]
  );

  useEffect(() => {
    if (!autoFocus || !formRef.current || !containerEl.current) return;
    const form = containerEl.current.querySelector('form');
    if (!form) return;
    const firstField = formRef.current?.getRegisteredFields()[1];
    const input: HTMLInputElement = form[firstField];
    input?.focus();
  }, []);

  if (!config.schema) return null;

  return (
    <div
      className={`pr-block-form ${className}          block-form`}
      id={sectionId}
      ref={containerEl}
    >
      {config.title && (
        <div className="pr-block-form__title">{localize(config.title)}</div>
      )}
      <SchemaForm
        schema={localizedSchema}
        utils={{
          uploadFile,
        }}
        initialValues={initialValues}
        onChange={(v: any) => {
          setHasError(
            Object.keys(formRef?.current?.getState().errors || {}).length > 0
          );

          if (!canChange.current) return;
          onChange(v);
        }}
        onSubmit={onSubmit}
        buttons={
          config.hideSubmit
            ? []
            : [
                ({ disabled }: any) => (
                  <div
                    key={0}
                    className="pr-block-form__buttons-container        block-form__buttons-container buttons-container"
                  >
                    {customButtons}
                    <Button
                      type="submit"
                      variant="primary"
                      className="pr-block-form__button        buttons-container__button button"
                      disabled={disabled || !!config.disabledSubmit || hasError}
                    >
                      {localize(config.submitLabel) || t('form.submit')}
                    </Button>
                  </div>
                ),
              ]
        }
        formRef={formRef}
        initialFieldObjectVisibility={!config.collapsed}
      />
    </div>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  padding: var(--pr-form-padding);
}

:block .pr-block-form__buttons-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

:block .pr-block-form__buttons-container .pr-block-form__button {
  margin-left: 1rem;
}

:block .pr-block-form__button {
  padding-bottom: 1rem !important;
  padding-top: 1rem !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  height: 100%;
}

.pr-form-autocomplete .ant-select-selector {
  padding: 0 ! important;
}
.pr-form-field--error > input {
  border-color: var(--error-color, red);
}
`;
export const FormInContext = () => {
  const {
    components: { SchemaForm, Link },
    utils: { uploadFile },
  } = useBlocks();
  const { config, events } = useBlock<FormConfig>();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Form
        {...config}
        SchemaForm={SchemaForm}
        uploadFile={uploadFile}
        events={events}
        Link={Link}
      />
    </BaseBlock>
  );
};
FormInContext.styles = defaultStyles;

export default FormInContext;
