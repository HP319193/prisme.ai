import { Fieldset as PRFieldset, FieldsetProps } from 'primereact/fieldset';
import { FC } from 'react';

export const Fieldset: FC<FieldsetProps> = (props) => (
  <PRFieldset className="pt-5 mb-4" {...props} />
);

export default Fieldset;
