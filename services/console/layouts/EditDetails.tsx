import {
  CloseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Popover, Modal } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import Form from '../components/SchemaForm/Form';
import { Schema } from '../components/SchemaForm/types';
import useLocalizedText from '../utils/useLocalizedText';
import { useWorkspace } from './WorkspaceLayout';

interface EditDetailsprops {
  schema: Schema;
  value: any;
  onSave: (values: any) => void;
  onDelete: () => void;
  context?: string;
}

export const EditDetails = ({
  schema,
  value,
  onSave,
  onDelete,
  context,
}: EditDetailsprops) => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();

  const confirmDelete = useCallback(() => {
    Modal.confirm({
      icon: <DeleteOutlined />,
      title: t('details.delete.confirm.title', {
        name: localize(value.name),
        context,
      }),
      content: t('details.delete.confirm.content', { context }),
      cancelText: t('details.delete.confirm.ok', { context }),
      okText: t('details.delete.confirm.cancel', { context }),
      onCancel: () => {
        onDelete();
      },
      zIndex: 1031,
    });
  }, [context, localize, onDelete, t, value.name]);

  return (
    <Popover
      className="ml-2"
      title={({ setVisible }) => (
        <div className="flex flex-1 justify-between">
          {t('details.title', { context })}
          <button onClick={() => setVisible(false)}>
            <CloseCircleOutlined />
          </button>
        </div>
      )}
      content={({ setVisible }) => (
        <>
          <Form
            schema={schema}
            onSubmit={(values) => {
              onSave(values);
              setVisible(false);
            }}
            initialValues={value}
            submitLabel={t('details.save', { context })}
          />
          <Button
            variant="grey"
            className="flex items-center !absolute bottom-2 right-2"
            onClick={confirmDelete}
          >
            <DeleteOutlined className="mr-2" />
            {t('details.delete.label', { context })}
          </Button>
        </>
      )}
      overlayClassName="min-w-[50%]"
    >
      <SettingOutlined />
    </Popover>
  );
};

export default EditDetails;
