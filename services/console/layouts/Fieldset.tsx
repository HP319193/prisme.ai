import { FC, ReactElement } from 'react';
import { Divider } from 'antd';

export interface FieldsetProps {
  legend: string;
  children: ReactElement | string;
}

export const Fieldset: FC<FieldsetProps> = ({ legend, children }) => (
  <div>
    <Divider orientation="left">{legend}</Divider>
    {children}
  </div>
);

export default Fieldset;
