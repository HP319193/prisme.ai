import {
  Modal,
  notification,
  TextArea,
  Select,
  Tooltip,
} from '@prisme.ai/design-system';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../providers/Workspace';
import api from '../utils/api';
import { useDateFormat } from '../utils/dates';
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
  const dateFormat = useDateFormat();
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
      Object.entries(workspace?.repositories || {})
        .filter(([_, repo]) => repo.type !== 'archive')
        .map(([key, repo]) => ({
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

  const [version, setVersion] = useState('latest');
  const [versions, setVersions] =
    useState<{ label: ReactNode; value: string }[]>();
  useEffect(() => {
    if (visible !== 'pull') return;
    async function fetchVersions() {
      const events = await api.getEvents(workspace.id, {
        type: 'workspaces.versions.published',
        limit: 10,
      });
      const versions = events.flatMap(({ payload: { version } }) =>
        version
          ? [
              {
                label: (
                  <Tooltip
                    title={
                      <div>
                        <div>{version.name}</div>
                        <div>
                          {dateFormat(new Date(version.createdAt), {
                            relative: true,
                          })}
                        </div>
                      </div>
                    }
                    placement="right"
                  >
                    {version.description || version.name}
                  </Tooltip>
                ),
                value: version.name,
              },
            ]
          : []
      );
      if (versions.length) {
        setVersion('latest');
        if (versions.length === 10) {
          versions.unshift({
            label: <div>{t('workspace.versions.pull.version.latest')}</div>,
            value: 'latest',
          });
          versions.push({
            label: (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  push(
                    '/workspaces/KgIMCs2?type=workspaces.versions.published'
                  );
                  close();
                }}
              >
                {t('workspace.versions.pull.version.older')}
              </button>
            ),
            value: '',
          });
        }
      }
      setVersions(versions);
    }
    fetchVersions();
  }, [close, dateFormat, push, t, visible, workspace.id]);

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
            .versions.rollback(version || 'latest', {
              repository: remoteRepository,
            });
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
      } catch (err) {
        notification.error({
          message: `${err}`,
          placement: 'bottomRight',
        });
      }
    },
    [trackEvent, repository, t, workspace.id, description, version, push]
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
        {versions && (
          <label className="flex flex-col mb-2">
            {t('workspace.versions.pull.version.label')}
            <Select
              value={version}
              selectOptions={versions}
              onChange={setVersion}
            />
          </label>
        )}
        <label className="flex flex-col">
          {t('workspace.versions.repository')}
          <Select
            value={repository}
            selectOptions={
              visible === 'push' ? writeRepositories : readRepositories
            }
            onChange={(value) => setRepository(value)}
          />
        </label>
      </div>
    </Modal>
  );
};

export default VersionModal;
