import { useEffect, useRef } from 'react';

export const OnChange = ({
  values,
  onChange,
}: {
  values: any;
  onChange: (v: any) => void;
}) => {
  const dirty = useRef(false);
  useEffect(() => {
    console.log({ values, dirty });
    const { current: isDirty } = dirty;
    dirty.current = true;
    if (!isDirty || !onChange || !values) return;
    onChange(values.values);
  }, [values, onChange, dirty]);
  return null;
};

export default OnChange;
