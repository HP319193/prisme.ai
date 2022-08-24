import { Form } from 'antd';
import editableContext from './EditableContext';

interface EditableRowProps {
  index: number;
}

export const EditableRow: React.FC<EditableRowProps> = ({
  index,
  ...props
}) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <editableContext.Provider value={form}>
        <tr {...props} />
      </editableContext.Provider>
    </Form>
  );
};

export default EditableRow;
