import Description from './Description';
import { FieldProps, UiOptionsUpload } from './types';
import { getLabel } from './utils';
import { useField } from 'react-final-form';
import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import { DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import Button from '../Button';
import { Tooltip } from 'antd';
import { useSchemaForm } from './context';
import { WithLabel } from '../Label';

const defaultAccept = 'image/gif,image/jpeg,image/png,image/svg+xml,';
export const FieldTextUpload = ({
  schema = {},
  label,
  name,
  options,
}: FieldProps & {
  options: UiOptionsUpload;
}) => {
  const field = useField(name);
  const {
    locales = {},
    utils: { uploadFile },
  } = useSchemaForm();
  const [preview, setPreview] = useState<ReactElement | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');

  const readFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      if (!target || typeof target.result !== 'string') return;
      const value = await uploadFile(
        target.result.replace(
          /base64/,
          `filename:${file.name.replace(/;/g, '-')}; base64`
        )
      );
      setPreviewLabel('');
      if (typeof value === 'string') {
        field.input.onChange(value);
        setPreview(<img src={value} className="max-h-24" />);
      } else {
        const { value: v, preview, label } = value;
        if (v) {
          field.input.onChange(v);
          if (preview) {
            setPreview(
              typeof preview === 'string' ? (
                <img src={preview} className="max-h-24" />
              ) : (
                preview
              )
            );
          }
          if (label) {
            setPreviewLabel(label);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <Description text={schema.description}>
      <WithLabel label={label || schema.title || getLabel(name)}>
        <div className="ant-input">
          <div className="relative p-2 ">
            <div className="flex flex-row border-4 border-dashed border-gray-200 !rounded-[0.3rem] min-h-[50px] p-2 items-center overflow-hidden">
              <div className="mr-2">
                {field.input.value ? (
                  preview
                ) : (
                  <PictureOutlined className="text-4xl !text-gray-200 flex items-center" />
                )}
              </div>
              {previewLabel || locales.uploadLabel || 'Choose file'}
            </div>

            <input
              type="file"
              className="absolute top-0 left-0 right-0 bottom-0 opacity-0 cursor-pointer"
              onChange={readFile}
              accept={
                (options && options.upload && options.upload.accept) ||
                defaultAccept
              }
              multiple={false}
            />
            {field.input.value && (
              <Tooltip
                title={locales.uploadRemove || 'Remove file'}
                placement="left"
              >
                <Button
                  onClick={() => {
                    field.input.onChange('');
                    setPreview(null);
                    setPreviewLabel('');
                  }}
                  className="!absolute top-2 right-2"
                  variant="link"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </WithLabel>
    </Description>
  );
};

export default FieldTextUpload;
