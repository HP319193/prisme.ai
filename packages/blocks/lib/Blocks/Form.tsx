import '../i18n';
import { Button, Schema } from '@prisme.ai/design-system';
import { useBlock } from '../Provider';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import tw from '../tw';
import BlockTitle from './Internal/BlockTitle';
import useLocalizedText from '../useLocalizedText';
import { useBlocks } from '../Provider/blocksContext';
import { BlockComponent } from '../BlockLoader';

const defaultSchema = {
  type: 'string',
  title: 'preview',
};

interface FormConfig {
  title?: Prismeai.LocalizedText;
  schema: Schema;
  onChange?: string;
  onSubmit?: string;
  submitLabel?: string;
  hideSubmit?: boolean;
  disabledSubmit?: boolean;
  disableSubmitDelay?: number;
  values?: Record<string, any>;
}

export const Form: BlockComponent = () => {
  const {
    components: { SchemaForm },
  } = useBlocks();
  const { config, events } = useBlock<FormConfig>();
  const { t } = useTranslation();
  const { localize, localizeSchemaForm } = useLocalizedText();
  const {
    utils: { uploadFile },
  } = useBlocks();
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
    if (
      !config.values ||
      JSON.stringify(config.values) === JSON.stringify(initialValues)
    )
      return;

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

  if (!config.schema) return null;

  return (
    <div className={tw`block-form p-8 flex-1`}>
      {config.title && <BlockTitle value={localize(config.title)} />}
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
                    className={tw`block-form__buttons-container buttons-container flex flex-1 justify-end mt-2 pt-4`}
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      className={tw`buttons-container__button button !py-4 !px-8 h-full`}
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

export default Form;
