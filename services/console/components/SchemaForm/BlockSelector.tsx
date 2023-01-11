import {
  InfoBubble,
  Schema,
  SchemaForm,
  schemaFormUtils,
  Select,
  StretchContent,
  useSchemaForm,
} from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { useField } from 'react-final-form';
import { Tooltip } from 'antd';
import FieldContainerWithRaw from '../FieldContainerWithRaw';
import useBlocks from '../PageBuilder/useBlocks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import useLocalizedText from '../../utils/useLocalizedText';
import getEditSchema from '../PageBuilder/Panel/EditSchema/getEditSchema';
import { RightOutlined } from '@ant-design/icons';

export const BlockSelector: FieldComponent = (props) => {
  const { t } = useTranslation('workspaces');
  const { localize, localizeSchemaForm } = useLocalizedText();
  const field = useField(props.name);
  const hasError = schemaFormUtils.getError(field.meta);
  const { variants: blocks } = useBlocks();
  const [schema, setSchema] = useState<Schema | null>(null);
  const [values, setValues] = useState(field.input.value || {});
  const { utils, locales, components } = useSchemaForm();
  const [visible, setVisible] = useState(true);

  const fetchSchema = useCallback(
    async (name: string) => {
      await setSchema(null);
      const block = blocks.find(({ slug }) => slug === name);
      if (!block) return null;
      if (block.builtIn) {
        const schema = getEditSchema(block.slug);
        setSchema(schema && localizeSchemaForm(schema));
      }
    },
    [blocks, localizeSchemaForm]
  );

  useEffect(() => {
    fetchSchema(field.input.value?.name);
  }, [fetchSchema, field.input.value?.name]);

  const prevValues = useRef(values);
  useEffect(() => {
    if (prevValues.current === values) return;
    const newValue = {
      ...(field.input.value || {}),
      ...values,
    };
    if (JSON.stringify(field.input.value) === JSON.stringify(newValue)) return;
    field.input.onChange(newValue);
  }, [field.input, values]);

  const selectOptions = useMemo(
    () =>
      blocks.map(({ slug, name, description, photo }) => ({
        label: (
          <Tooltip
            title={
              localize(description) ? (
                <>
                  {localize(description)}
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={localize(name)}
                      className="bg-white rounded"
                    />
                  )}
                </>
              ) : (
                ''
              )
            }
          >
            <div className="flex flex-1">{localize(name)}</div>
          </Tooltip>
        ),
        value: slug,
      })),
    [blocks, localize]
  );

  const filterOption = useCallback(
    (input: string, options: any) => {
      const block = blocks.find(({ slug }) => slug === options.value);
      if (!block) return false;
      const search = `${block.slug} ${localize(block.name)} ${localize(
        block.description
      )}`.toLowerCase();
      return search.includes(input);
    },
    [blocks, localize]
  );

  return (
    <FieldContainerWithRaw
      {...props}
      className="pr-form-block-selector pr-form-object"
    >
      <button
        type="button"
        className={`pr-form-object__label pr-form-label ${
          visible ? 'pr-form-object__label--visible' : ''
        }`}
        onClick={() => setVisible(!visible)}
      >
        <RightOutlined className="pr-form-object__label-icon" />

        <span>
          {props.schema.title || schemaFormUtils.getLabel(field.input.name)}
        </span>

        <InfoBubble
          className="pr-form-object__description"
          text={props.schema.description}
        />
      </button>
      <StretchContent visible={visible}>
        <div className="pr-form-object__properties">
          <Tooltip title={hasError} overlayClassName="pr-form-error">
            <div className="flex-col m-[1rem]">
              <div className="flex flex-col">
                <label
                  htmlFor={`${field.input.name}.name`}
                  className="pr-form-block-selector__label pr-form-label"
                >
                  {t('form.blockSelector.name.label')}
                </label>
                <Select
                  id={`${field.input.name}.name`}
                  selectOptions={selectOptions}
                  value={field.input.value?.name}
                  onChange={(name) => {
                    setValues({ name });
                  }}
                  showSearch
                  filterOption={filterOption}
                />
              </div>
              {schema && (
                <div className="!-mx-[1rem]">
                  <SchemaForm
                    schema={schema}
                    locales={locales}
                    buttons={[]}
                    initialValues={values}
                    utils={utils}
                    components={components}
                    onChange={(v) => {
                      setValues((prev: any) => {
                        const newValue = {
                          ...prev,
                          ...v,
                        };
                        if (JSON.stringify(prev) === JSON.stringify(newValue))
                          return prev;
                        return newValue;
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </Tooltip>
        </div>
      </StretchContent>
    </FieldContainerWithRaw>
  );
};

export default BlockSelector;
