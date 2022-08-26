import { FC, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Input, InputRef, Form, Switch } from 'antd';
import { useEditable } from './EditableContext';
import { DataType } from './types';
import tw from '../../tw';

interface Item {
  key: string;
  [k: string]: any;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  type: DataType;
  handleSave: (record: Item) => void;
}

const TypesAutoEdit = ['boolean'];
const TypesEditable = ['string', 'number', 'boolean', 'date'];

const CellInput = forwardRef<any, any>(
  (
    { dataIndex, title, save, type }: EditableCellProps & { save: any },
    ref
  ) => {
    if (type === 'boolean') {
      return (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          valuePropName="checked"
        >
          <Switch onChange={save} />
        </Form.Item>
      );
    }
    return (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={ref} onPressEnter={save} onBlur={save} type={type} />
      </Form.Item>
    );
  }
);

const EditableCell: FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  type,
  ...restProps
}) => {
  const [editing, setEditing] = useState(TypesAutoEdit.includes(type));
  const inputRef = useRef<InputRef>(null);
  const form = useEditable();
  const canEdit = TypesEditable.includes(type);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form && form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = form && (await form.validateFields());
      if (!TypesAutoEdit.includes(type)) {
        toggleEdit();
      }
      handleSave({ ...record, ...values });
    } catch {}
  };

  const childNode = useMemo(() => {
    if (canEdit && editable) {
      return editing ? (
        <CellInput
          value={record[dataIndex]}
          title={title}
          ref={inputRef}
          dataIndex={dataIndex}
          type={type}
          save={save}
        />
      ) : (
        <div
          className={tw`cursor-pointer py-2 px-3 min-w-[145px]`}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
    return children;
  }, [editable, editing, title, children, dataIndex]);

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
