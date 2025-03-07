import { Input, Modal, notification, Tooltip } from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SLUG_MATCH_INVALID_CHARACTERS,
  SLUG_VALIDATION_REGEXP,
} from '../utils/regex';
import { usePrevious } from '../utils/usePrevious';
import useLocalizedText from '../utils/useLocalizedText';
import api from '../utils/api';
import { useWorkspace } from '../providers/Workspace';
import { useTracking } from './Tracking';

interface PublishModalProps {
  visible: boolean;
  close: () => void;
}

const PublishModal = ({ visible, close }: PublishModalProps) => {
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const [publishSlug, setPublishSlug] = useState('');
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const prevWorkspaceId = usePrevious(workspace.id);
  const { trackEvent } = useTracking();

  const getCurrentlyPublishedApp = useCallback(async () => {
    const currentlyPublishedApp = await api.getApps({
      workspaceId: workspace.id,
    });
    if (currentlyPublishedApp) {
      const apps = Array.from(currentlyPublishedApp.values());
      if (apps.length > 0 && apps[0] && apps[0].slug) {
        setPublishSlug(apps[0].slug);
        setAlreadyPublished(true);
      }
    }
  }, [workspace.id]);

  const slug = useMemo(
    () =>
      publishSlug ||
      localize(workspace.name).replace(SLUG_MATCH_INVALID_CHARACTERS, ''),
    [localize, publishSlug, workspace.name]
  );

  useEffect(() => {
    if (prevWorkspaceId === workspace.id) return;
    getCurrentlyPublishedApp();
  }, [getCurrentlyPublishedApp, workspace.id, prevWorkspaceId]);

  const onConfirm = useCallback(async () => {
    trackEvent({
      name: 'Publish as App',
      action: 'click',
    });
    try {
      await api.publishApp({
        workspaceId: workspace.id,
        slug,
      });
      notification.success({
        message: t('apps.publish.confirm.toast'),
        placement: 'bottomRight',
      });
    } catch (err) {
      const error = err as Error;
      notification.error({
        message: t('unknown', { errorName: error.message, ns: 'errors' }),
        placement: 'bottomRight',
      });
      console.error(error);
      return null;
    }
  }, [slug, t, trackEvent, workspace.id]);

  const isSlugValid = useMemo(
    () => slug.length > 0 && SLUG_VALIDATION_REGEXP.test(slug),
    [slug]
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
      cancelText={t('cancel', { ns: 'common' })}
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
              value={slug}
              onChange={(event) => setPublishSlug(event.target.value)}
            />
          </div>
        </Tooltip>
      </div>
    </Modal>
  );
};

export default PublishModal;
