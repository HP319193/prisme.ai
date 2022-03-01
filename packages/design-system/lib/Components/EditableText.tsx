import { Typography } from 'antd';

const { Text } = Typography;

export interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const EditableText = ({ value, onChange, ...props }: EditableTextProps) => {
  return (
    <Text editable={{ onChange }} {...props}>
      {value}
    </Text>
  );
};

export default EditableText;
