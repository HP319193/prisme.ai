import { FieldProps, UiOptionsUpload, defaultUploadAccept } from './types';
import { useField } from 'react-final-form';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
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

interface FieldTextUploadProps extends FieldProps {
  options: UiOptionsUpload;
}

const Preview = ({ src }: { src: string }) => {
  return <img src={src} className="max-h-24 min-w-[3rem]" />;
};

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
    field.input.value ? <Preview src={field.input.value} /> : null
  );
  const [previewLabel, setPreviewLabel] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (field.input.value) {
      setPreview(<Preview src={field.input.value} />);
    }
  }, [field.input.value]);

  const readFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setError(false);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async ({ target }) => {
        if (!target || typeof target.result !== 'string') return;

        try {
          const value = await uploadFile(
            target.result.replace(
              /base64/,
              `filename:${file.name.replace(/[;\s]/g, '-')}; base64`
            )
          );
          setPreviewLabel('');
          if (typeof value === 'string') {
            field.input.onChange(value);
            setPreview(<Preview src={value} />);
          } else {
            const { value: v, preview, label } = value;
            if (v) {
              field.input.onChange(v);
              if (preview) {
                setPreview(
                  typeof preview === 'string' ? (
                    <Preview src={preview} />
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
        } catch (error) {
          setError(true);
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
      return <Preview src={defaultPreview} />;
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
      <div
        className={`pr-form-upload__input pr-form-input ${
          error ? 'pr-form-error' : ''
        }`}
      >
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
            defaultUploadAccept
          }
          multiple={false}
          data-testid={`schema-form-field-${field.input.name}`}
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
