import { FieldProps } from './types';

export const FieldNotImplemented = (props: FieldProps) => {
  console.warn('Field component not implemented', props);
  return null;
};

export default FieldNotImplemented;
