import { Input, InputProps, InputRef } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { ChangeEvent, forwardRef } from 'react';

export interface SearchInputProps extends InputProps {
  onClear?: () => void;
}

const SearchInput = forwardRef<InputRef, SearchInputProps>(
  ({ onClear, ...props }, ref) => (
    <Input
      ref={ref}
      prefix={<SearchOutlined className="text-gray" />}
      suffix={
        <button
          className={`transition-opacity opacity-${props.value ? '1' : '0'}`}
          onClick={() => {
            onClear?.();

            props.onChange?.({
              target: { value: '' },
            } as ChangeEvent<HTMLInputElement>);
          }}
        >
          <CloseOutlined />
        </button>
      }
      {...props}
    />
  )
);

export default SearchInput;
