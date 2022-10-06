import { FormEvent, useCallback, useMemo } from 'react';

interface ContentEditable {
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
  onRemove?: () => void;
  onEnter?: (value: string) => void;
}

export const useContentEditable = ({
  onChange,
  onInput,
  onEnter,
}: ContentEditable) => {
  const onFieldInput = useCallback(
    (e: FormEvent<HTMLSpanElement>) => {
      const target = e.target as HTMLSpanElement;
      onChange && onChange(target.innerText);
    },
    [onChange]
  );
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onInput && onInput(e.target.innerText);
        onEnter && onEnter(e.target.innerText);
      }
    },
    [onInput]
  );
  const onBlur = useCallback(
    (e) => {
      onInput && onInput(e.target.innerText);
    },
    [onInput]
  );
  return useMemo(
    () => ({
      onKeyDown,
      onBlur,
      onInput: onFieldInput,
      contentEditable: true,
      suppressContentEditableWarning: true,
    }),
    [onKeyDown, onBlur, onFieldInput]
  );
};

export default useContentEditable;
