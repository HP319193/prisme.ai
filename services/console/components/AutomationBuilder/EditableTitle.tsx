import { useContentEditable } from '@prisme.ai/design-system';
import { forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react';
import LocalizedInput from '../LocalizedInput';

interface EditableTitleProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: Prismeai.LocalizedText;
  onChange: (v: Prismeai.LocalizedText) => void;
  onEnter?: () => void;
}

const Input = forwardRef<any, any>(function Input(
  { value, onChange, onBlur, onEnter, ...props },
  ref
) {
  const contentEditable = useContentEditable({
    onInput: (v) => onChange({ target: { value: v } }),
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
        if (e.key === 'Enter' && onEnter) onEnter();
      }}
      ref={ref}
      {...props}
      className={`min-w-[5rem] max-w-[60vw] text-ellipsis overflow-hidden mr-8 mt-[0.4rem] ${props.className}`}
    >
      {value}
    </span>
  );
});

export const EditableTitle = ({ value, onChange }: EditableTitleProps) => {
  return <LocalizedInput value={value} onChange={onChange} Input={Input} />;
};

export default EditableTitle;
