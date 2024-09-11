import { Loading, Modal, SchemaForm } from '@prisme.ai/design-system';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalizedText from '../utils/useLocalizedText';
import { useWorkspace } from '../providers/Workspace';
import { useTracking } from './Tracking';
import api from '../utils/api';
import { notification } from 'antd';

interface EditSecretsModalProps {
  visible: boolean;
  close: () => void;
}

const EditSecretsModal = ({ visible, close }: EditSecretsModalProps) => {
  const {
    workspace: { id: workspaceId, secrets: { schema = {} } = {} },
  } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { trackEvent } = useTracking();
  const [values, setValues] = useState<any>({});
  const [loading, setLoading] = useState<any>(true);

  const fetchSecrets = async () => {
    const secrets = await api.getWorkspaceSecrets(workspaceId);
    const adaptedSecrets = Object.entries(secrets).reduce(
      (acc, [key, valueObj]) => ({ ...acc, [key]: valueObj.value }),
      {}
    );

    setValues(adaptedSecrets);
    setLoading(false);
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const onConfirm = useCallback(async () => {
    trackEvent({
      name: 'Save secrets',
      action: 'click',
    });
    if (loading) return;
    try {
      const adaptedValues = Object.entries(values).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: { value } }),
        {}
      );
      await api.updateWorkspaceSecrets(workspaceId, adaptedValues);
      notification.success({
        message: t('workspace.secrets.edit.success'),
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
  }, [t, trackEvent, workspaceId, values, loading]);

  return (
    <Modal
      open={visible}
      title={t('workspace.secrets.edit.modalTitle')}
      onOk={() => {
        onConfirm();
        close();
      }}
      okText={t('workspace.secrets.edit.save')}
      cancelText={t('cancel', { ns: 'common' })}
      onCancel={close}
    >
      <div className="p-10">
        {(!values || Object.keys(values).length == 0) && (
          <div className="mb-10">{t('workspace.secrets.edit.description')}</div>
        )}
        {loading ? (
          <Loading />
        ) : (
          <SchemaForm
            schema={{
              type: 'object',
              properties: schema,
              additionalProperties: true,
            }}
            initialValues={values}
            onChange={setValues}
            // onSubmit={submit}
            buttons={[]}
          />
        )}
      </div>
    </Modal>
  );
};

export default EditSecretsModal;
