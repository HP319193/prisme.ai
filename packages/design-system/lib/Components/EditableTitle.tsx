import { useState } from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

const EditableTitle = ({ value, onChange, ...props }: EditableTitleProps) => {
  return (
    <Title editable={{ onChange }} {...props}>
      {value}
    </Title>
  );
};

export default EditableTitle;
