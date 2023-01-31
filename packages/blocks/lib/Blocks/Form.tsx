import { Button, Schema } from '@prisme.ai/design-system';
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

const defaultSchema = {};

interface FormConfig extends BaseBlockConfig {
  title?: Prismeai.LocalizedText;
  schema: Schema;
  onChange?: string;
  onSubmit?: string;
  submitLabel?: string;
  hideSubmit?: boolean;
  disabledSubmit?: boolean;
  disableSubmitDelay?: number;
  values?: Record<string, any>;
  buttons?: ActionConfig[];
}

interface FormProps extends FormConfig {
  events: BlockContext['events'];
  SchemaForm: BlocksDependenciesContext['components']['SchemaForm'];
  Link: BlocksDependenciesContext['components']['Link'];
  uploadFile: BlocksDependenciesContext['utils']['uploadFile'];
}

export const Form = ({
  events,
  SchemaForm,
  Link,
  uploadFile,
  className,
  buttons,
  ...config
}: FormProps) => {
  const { t } = useTranslation();
  const { localize, localizeSchemaForm } = useLocalizedText();
  const [mountedForm, setMountedForm] = useState(true);
  const [initialValues, setInitialValues] = useState(config.values || {});

  const onChange = useCallback(
    (values: any) => {
      if (!config.onChange || !events) return;
      events.emit(config.onChange, values);
    },
    [config.onChange, events]
  );

  useEffect(() => {
    if (!config.values || config.values === initialValues) return;

    const resetForm = async (values: any) => {
      setMountedForm(false);
      await setInitialValues(values);
      setMountedForm(true);
    };
    resetForm(config.values);
  }, [config.values]);

  const disabledSubmit = useRef(false);
  const onSubmit = useCallback(
    (values: any) => {
      if (disabledSubmit.current || !config.onSubmit || !events) return;
      disabledSubmit.current = true;
      setTimeout(
        () => (disabledSubmit.current = false),
        +(config.disableSubmitDelay || 1000)
      );

      events.emit(config.onSubmit, values);
    },
    [config.onSubmit, events]
  );

  const localizedSchema = useMemo(() => {
    return localizeSchemaForm(config.schema || defaultSchema);
  }, [config.schema, localizeSchemaForm]);

  const customButtons = useMemo(
    () =>
      (buttons || []).map((button, key) => (
        <Action key={key} {...button} events={events} Link={Link} />
      )),
    [buttons, events, Link]
  );

  if (!config.schema) return null;

  return (
    <div className={`pr-block-form ${className}          block-form`}>
      {config.title && (
        <div className="pr-block-form__title">{localize(config.title)}</div>
      )}
      {mountedForm && (
        <SchemaForm
          schema={localizedSchema}
          utils={{
            uploadFile,
          }}
          initialValues={initialValues}
          onChange={onChange}
          onSubmit={onSubmit}
          buttons={
            config.hideSubmit
              ? []
              : [
                  <div
                    key={0}
                    className="pr-block-form__buttons-container        block-form__buttons-container buttons-container"
                  >
                    {customButtons}
                    <Button
                      type="submit"
                      variant="primary"
                      className="pr-block-form__button        buttons-container__button button"
                      disabled={!!config.disabledSubmit}
                    >
                      {localize(config.submitLabel) || t('form.submit')}
                    </Button>
                  </div>,
                ]
          }
        />
      )}
    </div>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  padding: 2rem;
}

:block .pr-block-form__buttons-container {
  display: flex;
  flex: 1 1 0%;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

:block .pr-block-form__button {
  padding-bottom: 1rem !important;
  padding-top: 1rem !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  height: 100%;
}`;
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
