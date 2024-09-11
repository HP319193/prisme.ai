import { Loading, Modal, SchemaForm } from '@prisme.ai/design-system';
import { useCallback, useEffect, useRef, useState } from 'react';
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

interface SecretValue {
  [key: string]: any;
}

interface AdditionalValue {
  key: string;
  value: any;
}

const EditSecretsModal = ({ visible, close }: EditSecretsModalProps) => {
  const {
    workspace: { id: workspaceId, secrets: { schema = {} } = {} },
  } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { trackEvent } = useTracking();
  const [values, setValues] = useState<SecretValue>({});
  const [additionalValues, setAdditionalValues] = useState<AdditionalValue[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [deletedKeys, setDeletedKeys] = useState<string[]>([]);
  const [hadSecrets, setHadSecrets] = useState<boolean>(false);

  const prevAdditionalValuesRef = useRef<AdditionalValue[]>([]);

  const fetchSecrets = async () => {
    const secrets = await api.getWorkspaceSecrets(workspaceId);
    if (secrets && Object.keys(secrets).length > 0) setHadSecrets(true);
    const adaptedSecrets: SecretValue = {};
    const extraValues: AdditionalValue[] = [];

    // Split secrets between schema-based and additional
    Object.entries(secrets).forEach(([key, valueObj]) => {
      if (schema[key]) {
        adaptedSecrets[key] = valueObj.value;
      } else {
        extraValues.push({ key, value: valueObj.value });
      }
    });

    setValues(adaptedSecrets);
    prevAdditionalValuesRef.current = extraValues;
    setAdditionalValues(extraValues);
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
      // Combine schema values with additional values
      const mergedValues: SecretValue = {
        ...values,
        ...additionalValues.reduce(
          (acc, { key, value }) => ({ ...acc, [key]: value }),
          {}
        ),
      };

      const adaptedValues = Object.entries(mergedValues).reduce(
        (acc, [key, value]) => {
          acc[key] = { value };
          return acc;
        },
        {} as SecretValue
      );

      await api.updateWorkspaceSecrets(workspaceId, adaptedValues);

      await Promise.all(
        deletedKeys.map(async (key) => {
          try {
            await api.deleteWorkspaceSecrets(workspaceId, key);
          } catch (err) {
            console.error(`Error deleting secret key ${key}:`, err);
          }
        })
      );

      setDeletedKeys([]);

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
  }, [
    t,
    trackEvent,
    workspaceId,
    values,
    additionalValues,
    deletedKeys,
    loading,
  ]);

  const handleValuesChange = (newValues: SecretValue) => {
    setValues(newValues);
  };

  const handleAdditionalValuesChange = (newValues: AdditionalValue[]) => {
    const prevValues = prevAdditionalValuesRef.current;
    const deleted = prevValues
      .filter(
        (prevItem) => !newValues.some((newItem) => newItem.key === prevItem.key)
      )
      .map((deletedItem) => deletedItem.key);

    setDeletedKeys((prevDeletedKeys) => {
      const updatedDeletedKeys = [...prevDeletedKeys, ...deleted];
      console.log('Updated deletedKeys state:', updatedDeletedKeys);
      return updatedDeletedKeys;
    });

    setAdditionalValues(newValues);
    prevAdditionalValuesRef.current = newValues;
  };

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
        {!hadSecrets && (
          <div className="mb-10">{t('workspace.secrets.edit.description')}</div>
        )}
        {loading ? (
          <Loading />
        ) : (
          <>
            <SchemaForm
              schema={{
                type: 'object',
                properties: schema,
              }}
              initialValues={values}
              onChange={handleValuesChange}
              buttons={[]}
            />
            <SchemaForm
              schema={{
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    key: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                  },
                },
              }}
              initialValues={additionalValues}
              onChange={handleAdditionalValuesChange}
              buttons={[]}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default EditSecretsModal;
