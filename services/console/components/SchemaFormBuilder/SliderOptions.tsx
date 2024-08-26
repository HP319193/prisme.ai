import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { UiOptionsSlider } from '@prisme.ai/design-system';
import { Input, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import RichTextEditor from '../RichTextEditor';

interface SliderOptionsProps {
  value: Partial<UiOptionsSlider>;
  onChange: (v: UiOptionsSlider) => void;
}

export const SliderOptions = ({ value, onChange }: SliderOptionsProps) => {
  const { t } = useTranslation('common');

  const addStep = useCallback(() => {
    onChange({
      slider: {
        ...value?.slider,
        steps: [
          ...(value?.slider?.steps || []),
          {
            label: '',
            description: '',
            value: 0,
          },
        ],
      },
    });
  }, [onChange, value]);

  const removeStep = useCallback(
    (index: number) => () => {
      onChange({
        slider: {
          ...value?.slider,
          steps: (value?.slider?.steps || []).filter((v, k) => k !== index),
        },
      });
    },
    [onChange, value?.slider]
  );

  const udpateStepValue = useCallback(
    (index: number) => (key: string) => (newValue: string | number) => {
      onChange({
        slider: {
          ...value?.slider,
          steps: (value?.slider?.steps || []).map((item, k) =>
            k === index
              ? {
                  ...item,
                  [key]: newValue,
                }
              : item
          ),
        },
      });
    },
    [onChange, value?.slider]
  );

  return (
    <div>
      <label className="font-bold flex justify-between mb-2">
        {t('schemaForm.builder.uiOptions.slider.steps.label')}
        <div className="flex justify-end">
          <button onClick={addStep}>
            <Tooltip
              title={t('schemaForm.builder.uiOptions.slider.steps.add')}
              placement="left"
            >
              <PlusOutlined />
            </Tooltip>
          </button>
        </div>
      </label>
      <div>
        {(value?.slider?.steps || []).map(
          ({ description, label, value }, key) => (
            <div key={key} className="flex flex-col relative">
              <div className="flex flex-row">
                <div className="flex flex-col w-[30%]">
                  <label htmlFor={`value-${key}`}>
                    {t('schemaForm.builder.uiOptions.slider.steps.value.label')}
                  </label>
                  <Input
                    id={`value-${key}`}
                    type="number"
                    value={value}
                    onChange={({ target: { value } }) =>
                      udpateStepValue(key)('value')(+value)
                    }
                  />
                </div>
                <div className="flex flex-col flex-1 ml-2">
                  <label htmlFor={`label-${key}`}>
                    {t(
                      'schemaForm.builder.uiOptions.slider.steps._label.label'
                    )}
                  </label>
                  <Input
                    id={`label-${key}`}
                    value={label}
                    onChange={({ target: { value } }) =>
                      udpateStepValue(key)('label')(value)
                    }
                  />
                </div>
              </div>
              <div className="mt-2">
                <label>
                  {t(
                    'schemaForm.builder.uiOptions.slider.steps.description.label'
                  )}
                </label>
                <div className="-mt-6">
                  <RichTextEditor
                    value={description}
                    onChange={udpateStepValue(key)('description')}
                  />
                </div>
              </div>
              <button
                onClick={removeStep(key)}
                className="absolute top-0 right-0"
              >
                <Tooltip
                  title={t('schemaForm.builder.uiOptions.slider.steps.remove')}
                  placement="left"
                >
                  <DeleteOutlined />
                </Tooltip>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SliderOptions;
