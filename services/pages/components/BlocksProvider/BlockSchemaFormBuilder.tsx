import { InfoBubble, schemaFormUtils } from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import SchemaFormBuilder from '../../../console/components/SchemaFormBuilder/SchemaFormBuilder';
import { getI18n, I18nextProvider } from 'react-i18next';
import { get } from 'lodash';

export const BlockSchemaFormBuilder: FieldComponent = ({
  schema,
  name,
  className,
  label,
}) => {
  const field = useField(name);
  const form = useForm();
  const [formValues, setFormValues] = useState({});

  const [i18n, seti18n] = useState<ReturnType<typeof getI18n>>();
  useEffect(() => {
    try {
      /**
       * Translations are lost when going through BlocksProvider.
       * The easiest way to load translations is to pick them from
       * DOM and manually inject it in a new I18nProvider
       */
      const nextData = document.querySelector('#__NEXT_DATA__');
      const {
        props: {
          pageProps: {
            _nextI18Next: { initialI18nStore = {} },
          },
        },
      } = JSON.parse(nextData?.textContent || '');
      const i18n = getI18n();
      Object.entries(initialI18nStore).forEach(([lang, namespaces]) => {
        Object.entries(namespaces as {}).forEach(
          ([namespace, translations]) => {
            i18n.addResourceBundle(lang, namespace, translations);
          }
        );
      });
      seti18n(i18n);
    } catch {}
  }, []);

  useEffect(() => {
    form.subscribe(
      ({ values }) => {
        setFormValues(get(values, name));
      },
      {
        values: true,
      }
    );
  }, [form, name]);

  const hasError = schemaFormUtils.getError(field.meta);
  const _label =
    label ||
    schema.title ||
    schemaFormUtils.getLabel(field.input.name, schema.title);
  const children =
    label ||
    schema.title ||
    schemaFormUtils.getLabel(field.input.name, schema.title);

  const onChange = useCallback(
    (v) => {
      field.input.onChange(v);
    },
    [field.input]
  );

  if (!i18n) return null;

  return (
    <div className="pr-form-block">
      {_label && _label !== '' && (
        <label
          className={`${className} pr-form-block__label pr-form-label`}
          htmlFor={field.input.name}
          dangerouslySetInnerHTML={
            typeof children === 'string' ? { __html: children } : undefined
          }
        >
          {typeof children === 'object' ? children : undefined}
        </label>
      )}
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <I18nextProvider i18n={i18n}>
          <SchemaFormBuilder onChange={onChange} value={formValues} />
        </I18nextProvider>
      </Tooltip>
      <InfoBubble
        className="pr-form-block__description"
        text={schema.description}
      />
    </div>
  );
};

export default BlockSchemaFormBuilder;
