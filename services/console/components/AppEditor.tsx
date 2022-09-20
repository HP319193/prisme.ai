import {
  Button,
  Loading,
  notification,
  Schema,
  SchemaForm,
} from '@prisme.ai/design-system';
import { BlockLoader } from '@prisme.ai/blocks';
import api from '../utils/api';
import useAppConfig from '../utils/useAppConfig';
import { useWorkspace } from './WorkspaceProvider';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

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
  const { setDirty } = useWorkspaceLayout();
  const { appConfig, onAppConfigUpdate } = useAppConfig(workspaceId, appId);

  const onSubmit = async (value: any) => {
    try {
      await onAppConfigUpdate(value);
      notification.success({
        message: t('apps.saveSuccess'),
        placement: 'bottomRight',
      });
      setDirty(false);
    } catch (e) {
      notification.error({
        message: errorT('unknown', { errorName: e }),
        placement: 'bottomRight',
      });
    }
  };

  const onChange = useCallback(
    (value: any) => {
      const keys = Object.keys(value);
      const prevValue = keys.reduce(
        (prev, key) => ({
          ...prev,
          [key]: appConfig[key],
        }),
        {}
      );
      if (JSON.stringify(prevValue) === JSON.stringify(value)) return;
      setDirty(true);
    },
    [appConfig, setDirty]
  );

  if (!appConfig) return <Loading />;

  if (schema) {
    const s: Schema = {
      type: 'object',
      properties: schema as Schema['properties'],
    };

    return (
      <div className="p-6">
        <SchemaForm
          schema={s}
          onChange={onChange}
          onSubmit={onSubmit}
          initialValues={appConfig}
          buttons={[
            <div className="flex w-full justify-end mt-5" key="submit">
              <Button
                type="submit"
                className="!p-1"
                variant="primary"
                key="submit"
              >
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
