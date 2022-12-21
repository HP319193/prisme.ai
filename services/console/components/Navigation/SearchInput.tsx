import { CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';
import MagnifierIcon from '../../icons/magnifier.svgr';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  placeholder?: string;
}
export const SearchInput = ({
  value,
  onChange,
  onFocus,
  placeholder = 'workspace.search',
}: SearchInputProps) => {
  const { t } = useTranslation('workspaces');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-1 relative px-2 border-b-[1px] h-[4rem]">
      <button
        className={`m-4 focus:outline-none ${value ? 'text-accent' : ''}`}
        onClick={() => {
          onFocus && onFocus();
          setTimeout(() => {
            ref?.current?.focus();
          }, 200);
        }}
      >
        <MagnifierIcon
          height="1.2rem"
          width="1.2rem"
          className="text-[1.6rem] mr-2"
        />
      </button>
      <input
        ref={ref}
        className="flex flex-1 outline-none text-accent"
        value={value}
        onChange={({ target: { value } }) => onChange(value)}
        placeholder={t(placeholder)}
      />
      {value && (
        <button
          className="focus:outline-none m-1 hover:text-accent"
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
