import { useContentEditable } from '@prisme.ai/design-system';
import { forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react';
import LocalizedInput from '../LocalizedInput';

interface EditableTitleProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: Prismeai.LocalizedText;
  onChange: (v: Prismeai.LocalizedText) => void;
  onEnter?: (v: Prismeai.LocalizedText) => void;
}

const Input = forwardRef<any, any>(function Input(
  { value, onChange, onBlur, onEnter, ...props },
  ref
) {
  const contentEditable = useContentEditable({
    onInput: (v) => onChange({ target: { value: v } }),
    onEnter,
  });

  return (
    <span
      {...contentEditable}
      onBlur={(e) => {
        e.preventDefault();
        contentEditable.onBlur(e);
      }}
      onKeyDown={(e) => {
        contentEditable.onKeyDown(e);
      }}
      ref={ref}
      {...props}
      className={`min-w-[5rem] max-w-[50vw] text-ellipsis overflow-hidden mr-8 mt-[0.4rem] ${props.className}`}
    >
      {value}
    </span>
  );
});

export const EditableTitle = ({
  value,
  onChange,
  onEnter,
}: EditableTitleProps) => {
  return (
    <LocalizedInput
      value={value}
      onChange={onChange}
      Input={Input}
      InputProps={{ onEnter }}
    />
  );
};

export default EditableTitle;
