import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

export interface SearchInputProps {
  placeholder: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  onKeyPress?: KeyboardEventHandler<HTMLInputElement>;
  className?: string;
}

const SearchInput = ({ ...props }: SearchInputProps) => (
  <Input prefix={<SearchOutlined className="text-gray" />} {...props} />
);

export default SearchInput;
