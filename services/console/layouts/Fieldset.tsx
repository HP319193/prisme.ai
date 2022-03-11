import { FC, ReactElement } from 'react';
import { Divider, Title } from '@prisme.ai/design-system';

export interface FieldsetProps {
  legend: string;
  hasDivider?: boolean;
  children: ReactElement | string;
}

export const Fieldset: FC<FieldsetProps> = ({
  hasDivider = 'true',
  legend,
  children,
}) => (
  <div className="mt-5">
    {hasDivider && <Divider orientation="left" />}
    <Title level={4}>{legend}</Title>
    {children}
  </div>
);

export default Fieldset;
