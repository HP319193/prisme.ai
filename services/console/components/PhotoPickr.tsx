import { ChangeEvent, useCallback } from 'react';

interface PhotoPickrProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export const PhotoPickr = ({ label, value, onChange }: PhotoPickrProps) => {
  const readImage = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      if (!target.files || target.files.length !== 1) {
        target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = (e: any) => {
        onChange(e.target.result);
      };
      reader.readAsDataURL(target.files[0]);
      target.value = '';
    },
    [onChange]
  );
  return (
    <div className="flex flex-1 flex-col mb-5">
      <div className="text-gray pl-4 flex flex-1 flex-row justify-between text-xs mb-1">
        {label}
      </div>
      <div
        className="ant-input relative min-h-full p-4 cursor-pointer bg-contain bg-no-repeat bg-center"
        style={{
          backgroundImage: value ? `url(${value})` : undefined,
        }}
      >
        <input
          type="file"
          className="absolute top-0 left-0 bottom-0 right-0 opacity-0 cursor-pointer"
          onChange={readImage}
          accept="image/jpeg,image/png,image/gif"
        />
      </div>
    </div>
  );
};

export default PhotoPickr;
