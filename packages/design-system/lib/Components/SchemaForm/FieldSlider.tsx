import { useField } from 'react-final-form';
import { FieldProps, UiOptionsSlider } from './types';
import { Label } from './Label';
import { Tooltip, Slider } from 'antd';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';
import { getError } from './utils';
import { useMemo } from 'react';

export const FieldSlider = ({
  options,
  ...props
}: FieldProps & { options: UiOptionsSlider }) => {
  const field = useField(props.name);
  const hasError = getError(field.meta);
  const { slider: { steps, step } = {} } = options;

  const marks = useMemo(
    () =>
      (steps || []).reduce(
        (prev, { label, description, value, className }, index) => {
          let additionalProps = {};
          if (field.input.value === index) {
            additionalProps = {
              open: field.input.value === index,
              style: {
                zIndex: 10,
              },
            };
          }

          return {
            ...prev,
            [value]: {
              label: (
                <Tooltip
                  {...additionalProps}
                  title={
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  }
                  placement="bottom"
                  overlayClassName={className}
                >
                  <div>{label}</div>
                </Tooltip>
              ),
            },
          };
        },
        {}
      ),
    [steps, field.input.value]
  );
  const { min, max } = useMemo(() => {
    const values = (steps || []).map(({ value }) => +value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [steps]);

  const hasPreview =
    steps &&
    steps[field.input.value] &&
    marks?.[field.input.value as keyof typeof marks];

  return (
    <FieldContainer {...props} className="pr-form-text pr-form-text--slider">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-text__label pr-form-label"
      >
        {props.label}
      </Label>
      <div className="pr-form-text__input pr-form-input">
        <Tooltip title={hasError} overlayClassName="pr-form-error">
          <Slider
            {...field.input}
            included={false}
            marks={marks}
            step={step === undefined ? null : step}
            className="flex-1"
            min={min}
            max={max}
            tooltip={{ formatter: null }}
          />
        </Tooltip>
      </div>
      <InfoBubble
        className="pr-form-text__description"
        text={props.schema.description}
      />
      {hasPreview && (
        <div
          className="order-3 mt-8 invisible"
          dangerouslySetInnerHTML={{
            __html: steps[field.input.value].description,
          }}
        />
      )}
    </FieldContainer>
  );
};

export default FieldSlider;
