import { Modal, notification, TextArea } from '@prisme.ai/design-system';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../providers/Workspace';
import api from '../utils/api';

interface VersionModalProps {
  visible: boolean;
  close: () => void;
}

const VersionModal = ({ visible, close }: VersionModalProps) => {
  const [description, setDescription] = useState('');

  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();

  const onConfirm = useCallback(async () => {
    try {
      await api.workspaces(workspace.id).versions.create({ description });
      notification.success({
        message: (
          <button className="text-left">
            {t('workspace.versions.create.success')}
          </button>
        ),
        placement: 'bottomRight',
        onClick: () => {
          push(
            `/workspaces/${workspace.id}?type=workspaces.versions.published`
          );
        },
      });
    } catch (e) {}
  }, [description, push, t, workspace.id]);

  return (
    <Modal
      open={visible}
      title={t('workspace.versions.create.label')}
      onOk={() => {
        onConfirm();
        close();
      }}
      okText={t('apps.publish.confirm.ok')}
      cancelText={t('cancel', { ns: 'common' })}
      onCancel={close}
    >
      <div className="p-10">
        <div className="mb-10">
          {t('workspace.versions.create.description')}
        </div>

        <TextArea
          label={t('workspace.versions.create.name')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
    </Modal>
  );
};

export default VersionModal;
