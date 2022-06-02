import { Button, SchemaForm } from '@prisme.ai/design-system';
import { useBlock } from '../Provider';
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { tw } from 'twind';
import BlockTitle from './Internal/BlockTitle';
import useLocalizedTextBlock from '../useLocalizedTextBlock';

const defaultSchema = {
  type: 'string',
  title: 'preview',
};

export const Form = () => {
  const { config = {}, events } = useBlock();
  const { t } = useTranslation('pages');
  const { localize, localizeSchemaForm } = useLocalizedTextBlock();

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

  return (
    <div className={tw`p-8`}>
      {config.title && <BlockTitle value={config.title} />}
      <SchemaForm
        schema={localizedSchema}
        onChange={onChange}
        onSubmit={onSubmit}
        buttons={[
          <div key={0} className={tw`flex grow justify-end mt-2 pt-4`}>
            <Button
              type="submit"
              variant="primary"
              className={tw`!py-4 !px-8 !h-max`}
            >
              {localize(config.submitLabel) || t('blocks.form.submit')}
            </Button>
          </div>,
        ]}
      />
    </div>
  );
};

export default Form;
