import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { KeyboardEventHandler } from 'react';

export interface SearchInputProps {
  placeholder: string;
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
}

const SearchInput = ({ placeholder, onPressEnter }: SearchInputProps) => (
  <Input
    placeholder={placeholder}
    prefix={<SearchOutlined className="text-gray" />}
    onPressEnter={onPressEnter}
  />
);

export default SearchInput;
