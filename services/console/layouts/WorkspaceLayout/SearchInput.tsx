import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
}
export const SearchInput = ({ value, onChange, onFocus }: SearchInputProps) => {
  const { t } = useTranslation('workspaces');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-1 relative px-2 border-b-[1px] h-[4rem]">
      <button
        className="m-4 focus:outline-none"
        onClick={() => {
          onFocus && onFocus();
          setTimeout(() => {
            ref?.current?.focus();
          }, 200);
        }}
      >
        <SearchOutlined className="text-[1.6rem]" />
      </button>
      <input
        ref={ref}
        className="flex flex-1 outline-none"
        value={value}
        onChange={({ target: { value } }) => onChange(value)}
        placeholder={t('workspace.search')}
      />
      {value && (
        <button
          className="focus:outline-none m-1"
          onClick={() => {
            onChange('');
            ref?.current?.focus();
          }}
        >
          <CloseCircleOutlined />
        </button>
      )}
    </div>
  );
};
export default SearchInput;
