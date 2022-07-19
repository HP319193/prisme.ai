import '../i18n';
import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { useBlock } from '../Provider';
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import tw from '../tw';
import BlockTitle from './Internal/BlockTitle';
import useLocalizedText from '../useLocalizedText';
import { withI18nProvider } from '../i18n';

const defaultSchema = {
  type: 'string',
  title: 'preview',
};

interface FormConfig {
  title?: string;
  schema: Schema;
  onChange?: string;
  onSubmit?: string;
  submitLabel?: string;
  hideSubmit?: boolean;
}

export const Form = ({ edit }: { edit?: boolean }) => {
  const { config, events } = useBlock<FormConfig>();
  const { t } = useTranslation();
  const { localize, localizeSchemaForm } = useLocalizedText();

  const onChange = useCallback(
    (values: any) => {
      if (!config.onChange || !events) return;
      events.emit(config.onChange, values);
    },
    [config.onChange, events]
  );

  const onSubmit = useCallback(
    (values: any) => {
      if (!config.onSubmit || !events) return;
      events.emit(config.onSubmit, values);
    },
    [config.onSubmit, events]
  );

  const localizedSchema = useMemo(() => {
    return localizeSchemaForm(config.schema || defaultSchema);
  }, [config.schema, localizeSchemaForm]);

  if (!config.schema && !edit) return null;

  return (
    <div className={tw`block-form p-8 flex-1`}>
      {config.title && <BlockTitle value={config.title} />}
      <SchemaForm
        schema={localizedSchema}
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
                  >
                    {localize(config.submitLabel) || t('form.submit')}
                  </Button>
                </div>,
              ]
        }
      />
    </div>
  );
};

export default withI18nProvider(Form);
