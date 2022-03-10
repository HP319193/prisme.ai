import { Input, Modal } from '@prisme.ai/design-system';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notification } from 'antd';
import { useWorkspaces } from './WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { SLUG_MATCH_INVALID_CHARACTERS } from '../utils/regex';

interface PublishModalProps {
  visible: boolean;
  close: () => void;
}

const PublishModal = ({ visible, close }: PublishModalProps) => {
  const { publishApp } = useWorkspaces();
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const { t: errorT } = useTranslation('errors');
  const [publishName, setPublishName] = useState(
    workspace.name.replace(SLUG_MATCH_INVALID_CHARACTERS, '')
  );

  const onConfirm = useCallback(async () => {
    try {
      await publishApp({
        workspaceId: workspace.id,
        name: workspace.name,
        description: workspace.description,
        photo: workspace.photo,
        slug: publishName,
      });
      notification.success({
        message: t('apps.publish.confirm.toast'),
        placement: 'bottomRight',
      });
    } catch (e: any) {
      notification.error({
        message: errorT('api', { errorName: e.message }),
        placement: 'bottomRight',
      });
      console.error(e);
      return null;
    }
  }, [
    publishApp,
    publishName,
    t,
    workspace.description,
    workspace.id,
    workspace.name,
    workspace.photo,
  ]);

  return (
    <Modal
      visible={visible}
      title={t('apps.publish.confirm.title', {
        name: workspace.name,
      })}
      onOk={() => {
        onConfirm();
        close();
      }}
      okButtonProps={{ disabled: publishName.length === 0 }}
      okText={t('apps.publish.confirm.ok')}
      cancelText={commonT('cancel')}
      onCancel={close}
    >
      <div>
        <div className="mb-10">{t('apps.publish.confirm.content')}</div>
        <Input
          label={t('apps.publish.confirm.slugInput')}
          value={publishName}
          onChange={(event) => setPublishName(event.target.value)}
        />
      </div>
    </Modal>
  );
};

export default PublishModal;
