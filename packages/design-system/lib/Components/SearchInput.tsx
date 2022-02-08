import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { KeyboardEventHandler } from 'react';

export interface SearchInputProps {
  placeholder: string;
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
  className?: string;
}

const SearchInput = ({
  placeholder,
  onPressEnter,
  className,
}: SearchInputProps) => (
  <Input
    placeholder={placeholder}
    prefix={<SearchOutlined className="text-gray" />}
    onPressEnter={onPressEnter}
    className={className}
  />
);

export default SearchInput;
