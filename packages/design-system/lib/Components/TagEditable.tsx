import { Tag } from 'antd';
import { useState } from 'react';
import { Input, Space } from '../';

export interface TagEditableProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const TagEditable = ({ placeholder, onChange, value }: TagEditableProps) => {
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');

  const handleClose = (removedTag: any) => {
    onChange(value.filter((tag: any) => tag !== removedTag));
  };

  const handleInputChange = ({ target: { value } }: any) => {
    setInputValue(value);
  };

  const handleInputConfirm = () => {
    if (inputValue && value.indexOf(inputValue) === -1) {
      onChange([...value, inputValue]);
    }
    setInputValue('');
  };

  const handleEditInputChange = ({ target: { value } }: any) => {
    setEditInputValue(value);
  };

  const handleEditInputConfirm = () => {
    const newTags = [...value];
    newTags[editInputIndex] = editInputValue;
    onChange(newTags);
    setEditInputIndex(-1);
    setEditInputValue('');
  };

  return (
    <div className="flex grow flex-col">
      <Space size={[4, 4]} wrap>
        {value.map((tag: any, index: any) => {
          if (editInputIndex === index) {
            return (
              <Input
                key={tag}
                value={editInputValue}
                onChange={handleEditInputChange}
                onBlur={handleEditInputConfirm}
                onPressEnter={handleEditInputConfirm}
              />
            );
          }

          return (
            <Tag key={tag} closable onClose={() => handleClose(tag)}>
              <span
                onDoubleClick={(e) => {
                  if (index !== 0) {
                    setEditInputIndex(index);
                    setEditInputValue(tag);
                    e.preventDefault();
                  }
                }}
              >
                {tag}
              </span>
            </Tag>
          );
        })}
      </Space>
      <Input
        className="mt-2"
        type="text"
        size="small"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputConfirm}
        onPressEnter={handleInputConfirm}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TagEditable;
