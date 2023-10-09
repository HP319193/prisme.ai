import {
  Button,
  Loading,
  notification,
  Schema,
} from '@prisme.ai/design-system';
import { BlockLoader } from '@prisme.ai/blocks';
import api from '../utils/api';
import useAppConfig from '../utils/useAppConfig';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import useLocalizedText from '../utils/useLocalizedText';
import { useWorkspace } from '../providers/Workspace';
import SchemaForm from './SchemaForm/SchemaForm';

interface AppEditorProps {
  schema?: Schema;
  block?: string;
  appId: string;
}

const AppEditor = ({ schema, block, appId }: AppEditorProps) => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { t: commmonT } = useTranslation('common');
  const { t: errorT } = useTranslation('errors');
  const { appConfig, onAppConfigUpdate } = useAppConfig(workspaceId, appId);
  const { localizeSchemaForm } = useLocalizedText();

  const onSubmit = async (value: any) => {
    try {
      await onAppConfigUpdate(value);
      notification.success({
        message: t('apps.saveSuccess'),
        placement: 'bottomRight',
      });
    } catch (e) {
      notification.error({
        message: errorT('unknown', { errorName: e }),
        placement: 'bottomRight',
      });
    }
  };

  const onChange = useCallback(
    (value: any) => {
      const keys = Object.keys(value || {});
      const prevValue = keys.reduce(
        (prev, key) => ({
          ...prev,
          [key]: appConfig[key],
        }),
        {}
      );
      if (JSON.stringify(prevValue) === JSON.stringify(value || {})) return;
    },
    [appConfig]
  );

  if (!appConfig) return <Loading />;

  if (schema) {
    const s: Schema = {
      type: 'object',
      properties: localizeSchemaForm(schema) as Schema['properties'],
    };

    return (
      <div>
        <SchemaForm
          schema={s}
          onChange={onChange}
          onSubmit={onSubmit}
          initialValues={appConfig}
          buttons={[
            <div className="pr-form-submit flex justify-end" key="submit">
              <Button type="submit" variant="primary" key="submit">
                {commmonT('save')}
              </Button>
            </div>,
          ]}
        />
      </div>
    );
  }
  if (block) {
    return (
      <BlockLoader
        api={api}
        url={block}
        token={`${api.token}`}
        workspaceId={workspaceId}
        appInstance={appId}
        config={{}}
        appConfig={appConfig}
        onAppConfigUpdate={onAppConfigUpdate}
      />
    );
  }

  return null;
};

export default AppEditor;
