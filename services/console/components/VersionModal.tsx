import { Modal, TextArea } from '@prisme.ai/design-system';
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

  const onConfirm = useCallback(async () => {
    api.workspaces(workspace.id).versions.create({ description });
  }, [description, workspace.id]);

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
