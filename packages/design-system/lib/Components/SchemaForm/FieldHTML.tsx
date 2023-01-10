import { Tooltip } from 'antd';
import { useField } from 'react-final-form';
import { SchemaFormContext, useSchemaForm } from './context';
import FieldContainer from './FieldContainer';
import InfoBubble from './InfoBubble';
import Label from './Label';
import { FieldProps } from './types';
import { getError } from './utils';

export const FieldHTML = ({
  HTMLEditor,
  ...props
}: FieldProps & {
  HTMLEditor: SchemaFormContext['components']['HTMLEditor'];
}) => {
  const field = useField(props.name);
  const { 'ui:widget': uiWidget, 'ui:options': uiOptions = {} } = props.schema;

  if (!HTMLEditor) return null;

  const hasError = getError(field.meta);

  return (
    <FieldContainer {...props} className="pr-form-text">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-text__label pr-form-label"
      >
        {props.label}
      </Label>
      <Tooltip title={hasError} overlayClassName="pr-form-error">
        <div className="pr-form-input">
          <HTMLEditor {...field.input} options={uiOptions.html} />
        </div>
      </Tooltip>
      <InfoBubble
        className="pr-form-text__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

const LinkedFielHTML = (props: FieldProps) => {
  const {
    components: { HTMLEditor },
  } = useSchemaForm();
  return <FieldHTML {...props} HTMLEditor={HTMLEditor} />;
};

export default LinkedFielHTML;
