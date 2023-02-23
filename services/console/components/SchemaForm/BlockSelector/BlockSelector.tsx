import {
  InfoBubble,
  schemaFormUtils,
  StretchContent,
} from '@prisme.ai/design-system';
import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { useField } from 'react-final-form';
import { Tooltip } from 'antd';
import FieldContainerWithRaw from '../../FieldContainerWithRaw';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { RightOutlined } from '@ant-design/icons';
import Selector from './Selector';
import {
  BlockSelectorProvider,
  useBlockSelector,
} from './BlockSelectorProvider';
import Form from './Form';

export const BlockSelector: FieldComponent = (props) => {
  const { selectBlock, schema } = useBlockSelector();
  const { t } = useTranslation('workspaces');
  const field = useField(props.name);
  const hasError = schemaFormUtils.getError(field.meta);
  const [values, setValues] = useState(field.input.value || {});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    selectBlock(field.input.value?.slug);
  }, [field.input.value?.slug, selectBlock]);

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
                <Selector
                  id={`${field.input.name}.slug`}
                  value={field.input.value?.slug}
                  onChange={(slug) => {
                    setValues({ slug });
                  }}
                />
              </div>
              {schema && (
                <div className="!-mx-[1rem]">
                  <Form
                    values={values}
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

export const LinkedBlockSelector: FieldComponent = (props) => (
  <BlockSelectorProvider>
    <BlockSelector {...props} />
  </BlockSelectorProvider>
);

export default LinkedBlockSelector;
