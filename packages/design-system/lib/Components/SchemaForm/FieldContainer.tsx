import { FC } from 'react';
import { useSchemaForm } from './context';
import { FieldProps } from './types';

export const DefaultFieldContainer: FC<FieldProps> = ({
  children,
  className,
}) => {
  return <div className={`pr-form-field ${className}`}>{children}</div>;
};

export const FieldContainer: FC<FieldProps> = (props) => {
  const {
    components: { FieldContainer: C = DefaultFieldContainer },
  } = useSchemaForm();
  return <C {...props} />;
};

export default FieldContainer;
