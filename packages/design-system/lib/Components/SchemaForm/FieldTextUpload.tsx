import { FieldProps, UiOptionsUpload } from './types';
import { useField } from 'react-final-form';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import Button from '../Button';
import { Tooltip } from 'antd';
import { SchemaFormContext, useSchemaForm } from './context';
import { Label } from './Label';
import InfoBubble from './InfoBubble';
import FieldContainer from './FieldContainer';

const defaultAccept = 'image/gif,image/jpeg,image/png,image/svg+xml,';

interface FieldTextUploadProps extends FieldProps {
  options: UiOptionsUpload;
}

export const FieldTextUpload = ({
  locales,
  uploadFile,
  ...props
}: FieldTextUploadProps & {
  locales: SchemaFormContext['locales'];
  uploadFile: SchemaFormContext['utils']['uploadFile'];
}) => {
  const field = useField(props.name);
  const [preview, setPreview] = useState<ReactElement | null>(
    field.input.value ? (
      <img src={field.input.value} className="max-h-24" />
    ) : null
  );
  const [previewLabel, setPreviewLabel] = useState('');

  const readFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async ({ target }) => {
        if (!target || typeof target.result !== 'string') return;
        const value = await uploadFile(
          target.result.replace(
            /base64/,
            `filename:${file.name.replace(/[;\s]/g, '-')}; base64`
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
    },
    [setPreviewLabel, setPreview, preview, uploadFile]
  );

  const defaultPreview = useMemo(() => {
    const defaultPreview = props.options?.upload?.defaultPreview || (
      <PictureOutlined className="text-4xl !text-gray-200 flex items-center" />
    );
    if (typeof defaultPreview === 'string') {
      return <img src={defaultPreview} />;
    }

    return defaultPreview;
  }, []);

  return (
    <FieldContainer {...props} className="pr-form-upload">
      <Label
        field={field}
        schema={props.schema}
        className="pr-form-upload__label pr-form-label"
      >
        {props.label}
      </Label>
      <div className="pr-form-upload__input pr-form-input">
        <div className="pr-form-upload__placeholder">
          <div className="pr-form-upload__preview">
            {field.input.value ? preview : defaultPreview}
          </div>
          {previewLabel || locales.uploadLabel || 'Choose file'}
        </div>

        <input
          type="file"
          onChange={readFile}
          accept={
            (props.options &&
              props.options.upload &&
              props.options.upload.accept) ||
            defaultAccept
          }
          multiple={false}
        />
        {field.input.value && (
          <div className="pr-form-upload__delete">
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
                variant="link"
              >
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
      <InfoBubble
        className="pr-form-upload__description"
        text={props.schema.description}
      />
    </FieldContainer>
  );
};

const LinkedFieldTextUpload = (props: FieldTextUploadProps) => {
  const {
    locales = {},
    utils: { uploadFile },
  } = useSchemaForm();
  return (
    <FieldTextUpload {...props} locales={locales} uploadFile={uploadFile} />
  );
};
export default LinkedFieldTextUpload;
