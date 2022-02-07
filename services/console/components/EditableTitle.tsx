import { FC, LegacyRef, useCallback, useRef, useState } from 'react';
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import { InputText } from 'primereact/inputtext';
interface EditableTitleProps {
  title: string;
  onChange: (v: string) => void;
}
export const EditableTitle: FC<EditableTitleProps> = ({ title, onChange }) => {
  const [value, setValue] = useState(title);
  const inplace = useRef<Inplace & { close: Function }>(null);

  const submit = useCallback(() => {
    if (value.length !== 0) {
      onChange(value);
    }
    inplace.current && inplace.current.close();
  }, [onChange, value]);
  return (
    <Inplace closable className="flex" ref={inplace}>
      <InplaceDisplay>
        <div className="flex">{title}</div>
      </InplaceDisplay>
      <InplaceContent>
        <InputText
          value={value}
          onChange={({ target: { value } }) => setValue(value)}
          autoFocus
          onKeyDown={({ key }) => key === 'Enter' && submit()}
          onBlur={submit}
        />
      </InplaceContent>
    </Inplace>
  );
};
export default EditableTitle;
