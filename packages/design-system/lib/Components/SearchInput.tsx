import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { InputHTMLAttributes } from 'react';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {}

const SearchInput = ({ ...props }: SearchInputProps) => (
  <Input prefix={<SearchOutlined className="text-gray" />} {...props} />
);

export default SearchInput;
