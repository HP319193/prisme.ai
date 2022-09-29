import { Input, Modal, notification, Tooltip } from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaces } from './WorkspacesProvider';
import {
  SLUG_MATCH_INVALID_CHARACTERS,
  SLUG_VALIDATION_REGEXP,
} from '../utils/regex';
import { useApps } from './AppsProvider';
import { usePrevious } from '../utils/usePrevious';
import useLocalizedText from '../utils/useLocalizedText';
import { useWorkspace } from './WorkspaceProvider';

interface PublishModalProps {
  visible: boolean;
  close: () => void;
}

const PublishModal = ({ visible, close }: PublishModalProps) => {
  const { getApps } = useApps();
  const { publishApp } = useWorkspaces();
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { t: commonT } = useTranslation('common');
  const { t: errorT } = useTranslation('errors');
  const [publishSlug, setPublishSlug] = useState(
    localize(workspace.name).replace(SLUG_MATCH_INVALID_CHARACTERS, '')
  );
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const prevWorkspaceId = usePrevious(workspace.id);

  const getCurrentlyPublishedApp = useCallback(async () => {
    const currentlyPublishedApp = await getApps({
      workspaceId: workspace.id,
    });
    if (currentlyPublishedApp) {
      const apps = Array.from(currentlyPublishedApp.values());
      if (apps.length > 0 && apps[0] && apps[0].slug) {
        setPublishSlug(apps[0].slug);
        setAlreadyPublished(true);
      }
    }
  }, [getApps, workspace.id]);

  useEffect(() => {
    if (prevWorkspaceId === workspace.id) return;
    getCurrentlyPublishedApp();
  }, [getCurrentlyPublishedApp, workspace.id, prevWorkspaceId]);

  const onConfirm = useCallback(async () => {
    try {
      await publishApp({
        workspaceId: workspace.id,
        slug: publishSlug,
      });
      notification.success({
        message: t('apps.publish.confirm.toast'),
        placement: 'bottomRight',
      });
    } catch (err) {
      const error = err as Error;
      notification.error({
        message: errorT('unknown', { errorName: error.message }),
        placement: 'bottomRight',
      });
      console.error(error);
      return null;
    }
  }, [
    errorT,
    publishApp,
    publishSlug,
    t,
    workspace.description,
    workspace.id,
    workspace.photo,
  ]);

  const isSlugValid = useMemo(
    () => publishSlug.length > 0 && SLUG_VALIDATION_REGEXP.test(publishSlug),
    [publishSlug]
  );

  return (
    <Modal
      open={visible}
      title={t('apps.publish.confirm.title', {
        name: localize(workspace.name),
      })}
      onOk={() => {
        onConfirm();
        close();
      }}
      okButtonProps={{
        disabled: !isSlugValid,
      }}
      okText={t('apps.publish.confirm.ok')}
      cancelText={commonT('cancel')}
      onCancel={close}
    >
      <div className="p-10">
        <div className="mb-10">{t('apps.publish.confirm.content')}</div>
        <Tooltip
          title={
            alreadyPublished
              ? t('apps.publish.confirm.alreadyPublished')
              : !isSlugValid
              ? t('apps.publish.confirm.slugInvalid')
              : ''
          }
        >
          <div>
            <Input
              disabled={alreadyPublished}
              status={!isSlugValid ? 'error' : undefined}
              label={t('apps.publish.confirm.slugInput')}
              value={publishSlug}
              onChange={(event) => setPublishSlug(event.target.value)}
            />
          </div>
        </Tooltip>
      </div>
    </Modal>
  );
};

export default PublishModal;
