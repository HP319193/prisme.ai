import {
  Modal,
  notification,
  TextArea,
  Select,
} from '@prisme.ai/design-system';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../providers/Workspace';
import api from '../utils/api';
import { useTracking } from './Tracking';

interface VersionModalProps {
  visible: false | 'push' | 'pull';
  close: () => void;
}

const VersionModal = ({ visible, close }: VersionModalProps) => {
  const [description, setDescription] = useState('');
  const [repository, setRepository] = useState('__local__');

  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const { trackEvent } = useTracking();
  const { readRepositories, writeRepositories } = useMemo(() => {
    const repositories = [
      {
        label: 'Prisme.ai',
        value: '__local__',
        mode: 'read-write' as string,
      },
    ].concat(
      Object.entries(workspace?.repositories || {}).map(([key, repo]) => ({
        label: repo?.name,
        value: key,
        mode: repo.mode || 'read-write',
      }))
    );

    return {
      readRepositories: repositories.filter((cur) => cur.mode.includes('read')),
      writeRepositories: repositories.filter((cur) =>
        cur.mode.includes('write')
      ),
    };
  }, [workspace?.repositories]);

  const onConfirm = useCallback(
    async (mode: 'pull' | 'push') => {
      trackEvent({
        name: mode === 'push' ? 'Create a new Version' : 'Pull a version',
        action: 'click',
      });
      try {
        const remoteRepository =
          repository === '__local__'
            ? undefined
            : {
                id: repository,
              };
        if (mode === 'push') {
          await api
            .workspaces(workspace.id)
            .versions.create({ description, repository: remoteRepository });
        } else if (mode === 'pull') {
          await api
            .workspaces(workspace.id)
            .versions.rollback('latest', { repository: remoteRepository });
        }
        notification.success({
          message: (
            <button className="text-left">
              {mode === 'push'
                ? t('workspace.versions.create.success')
                : t('workspace.versions.pull.success')}
            </button>
          ),
          placement: 'bottomRight',
          onClick: () => {
            push(
              mode === 'push'
                ? `/workspaces/${workspace.id}?type=workspaces.versions.published`
                : `/workspaces/${workspace.id}?type=workspaces.imported`
            );
          },
        });
      } catch (e) {}
    },
    [description, push, t, trackEvent, workspace.id, repository]
  );

  return (
    <Modal
      open={!!visible}
      title={
        visible === 'push'
          ? t('workspace.versions.create.label')
          : t('workspace.versions.pull.label')
      }
      onOk={() => {
        if (visible) {
          onConfirm(visible);
        }
        close();
      }}
      okText={
        visible === 'push'
          ? t('apps.publish.confirm.ok')
          : t('workspace.versions.pull.confirm_ok')
      }
      cancelText={t('cancel', { ns: 'common' })}
      onCancel={close}
    >
      <div className="p-10">
        <div className="mb-10">
          {visible === 'push'
            ? t('workspace.versions.create.description')
            : t('workspace.versions.pull.description')}
        </div>
        {visible == 'push' ? (
          <>
            <TextArea
              label={t('workspace.versions.create.name')}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <br />
          </>
        ) : null}
        {t('workspace.versions.repository')}
        <br />
        <Select
          value={repository}
          selectOptions={
            visible === 'push' ? writeRepositories : readRepositories
          }
          onChange={(value) => setRepository(value)}
        />
      </div>
    </Modal>
  );
};

export default VersionModal;
