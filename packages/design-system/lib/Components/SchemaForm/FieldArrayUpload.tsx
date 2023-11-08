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

const Preview = ({ src }: { src: string[] }) => {
  return (
    <>
      {src.map((src) => (
        <img src={src} className="max-h-24 min-w-[3rem]" />
      ))}
    </>
  );
};

export const FieldArrayUpload = ({
  locales,
  uploadFile,
  ...props
}: FieldProps & {
  locales: SchemaFormContext['locales'];
  uploadFile: SchemaFormContext['utils']['uploadFile'];
}) => {
  const field = useField(props.name);
  const { 'ui:options': uiOptions = { upload: {} } } = props.schema as {
    'ui:options': UiOptionsUpload;
  };

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
      const uploadedFiles: string[] = [];
      const uploadedLabels: string[] = [];
      field.input.onChange([]);

      for (const file of Array.from(e.target.files)) {
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
              uploadedFiles.push(value);
              field.input.onChange([...uploadedFiles]);
              setPreview(<Preview src={[...uploadedFiles]} />);
              setPreviewLabel(`${uploadedFiles.length} files`);
            } else {
              const { value: v, preview, label } = value;
              if (v) {
                uploadedFiles.push(v);
                field.input.onChange([...uploadedFiles]);
                if (preview) {
                  setPreview(
                    typeof preview === 'string' ? (
                      <Preview src={[...uploadedFiles]} />
                    ) : (
                      preview
                    )
                  );
                }
                if (label) {
                  uploadedLabels.push(label);
                  const labelsSlice = uploadedLabels.join(', ').slice(0, 20);
                  const displayLabels =
                    labelsSlice.length == 20
                      ? `${labelsSlice}...`
                      : labelsSlice;
                  setPreviewLabel(`${displayLabels} (${uploadedFiles.length})`);
                }
              }
            }
          } catch (error) {
            setError(true);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [setPreviewLabel, setPreview, preview, uploadFile]
  );

  const defaultPreview = useMemo(() => {
    const defaultPreview = uiOptions?.upload?.defaultPreview || (
      <PictureOutlined className="text-4xl !text-gray-200 flex items-center" />
    );
    if (typeof defaultPreview === 'string') {
      return <Preview src={[defaultPreview]} />;
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
          <div className="pr-form-upload__preview pr-form-upload__multi-preview">
            {field.input.value ? preview : defaultPreview}
          </div>
          {previewLabel || locales.uploadLabel || 'Choose files'}
        </div>

        <input
          type="file"
          onChange={readFile}
          accept={
            (uiOptions && uiOptions?.upload && uiOptions?.upload?.accept) ||
            defaultUploadAccept
          }
          multiple={true}
        />
        {field.input.value && (
          <div className="pr-form-upload__delete">
            <Tooltip
              title={locales.uploadRemove || 'Remove files'}
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

const LinkedFieldArrayUpload = (props: FieldProps) => {
  const {
    locales = {},
    utils: { uploadFile },
  } = useSchemaForm();
  return (
    <FieldArrayUpload {...props} locales={locales} uploadFile={uploadFile} />
  );
};
export default LinkedFieldArrayUpload;
