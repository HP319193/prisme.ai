import Description from './Description';
import { FieldProps, UiOptionsUpload } from './types';
import { getLabel } from './utils';
import { useField } from 'react-final-form';
import { ChangeEvent, useCallback } from 'react';
import { DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import Button from '../Button';
import { Tooltip } from 'antd';
import { useSchemaForm } from './context';

const defaultAccept = 'image/gif,image/jpeg,image/png,image/svg+xml,';
export const FieldTextUpload = ({
  schema,
  label,
  name,
  options,
}: FieldProps & {
  options: UiOptionsUpload;
}) => {
  const field = useField(name);
  const { locales = {} } = useSchemaForm();

  const readFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (!target) return;
      field.input.onChange(
        typeof target.result === 'string'
          ? target.result.replace(
              /base64/,
              `filename:${file.name.replace(/;/g, '-')}; base64`
            )
          : target.result
      );
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <Description text={schema.description}>
      <label className="text-[10px] text-gray">
        {label || schema.title || getLabel(name)}
        <div className="ant-input">
          <div className="relative p-2 ">
            <div className="flex flex-row border-4 border-dashed border-gray-200 rounded min-h-[50px] p-2 items-center">
              <div className="mr-2">
                {field.input.value ? (
                  <img src={field.input.value} className="max-h-24" />
                ) : (
                  <PictureOutlined className="text-4xl text-gray-200 flex items-center" />
                )}
              </div>
              {locales.uploadLabel || 'Choose file'}
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
            <Tooltip
              title={locales.uploadRemove || 'Remove file'}
              placement="left"
            >
              <Button
                onClick={() => field.input.onChange('')}
                className="!absolute top-2 right-2"
                variant="link"
              >
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </div>
        </div>
      </label>
    </Description>
  );
};

export default FieldTextUpload;
