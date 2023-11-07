import { SchemaForm, UiOptionsUpload } from '@prisme.ai/design-system';
import { defaultAccept } from '@prisme.ai/design-system/lib/Components/SchemaForm/FieldTextUpload';
import { useTranslation } from 'next-i18next';

interface UploadOptionsProps {
  value: Partial<UiOptionsUpload>;
  onChange: (v: UiOptionsUpload) => void;
}

export const UploadOptions = ({ value, onChange }: UploadOptionsProps) => {
  const { t } = useTranslation('workspaces');

  return (
    <SchemaForm
      schema={{
        type: 'object',
        properties: {
          upload: {
            type: 'object',
            title: t('schema.uiOptions.upload.title'),
            properties: {
              accept: {
                type: 'string',
                title: t('schema.uiOptions.upload.accept.title'),
                description: t('schema.uiOptions.upload.accept.description'),
                default: defaultAccept,
              },
            },
          },
        },
      }}
      buttons={[]}
      initialValues={value}
      onChange={onChange}
    />
  );
};

export default UploadOptions;
