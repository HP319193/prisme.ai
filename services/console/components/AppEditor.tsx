import { Loading, Schema, SchemaForm } from '@prisme.ai/design-system';
import { BlockLoader } from '@prisme.ai/blocks';
import api from '../utils/api';
import useAppConfig from '../utils/useAppConfig';
import { useWorkspace } from './WorkspaceProvider';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';

interface AppEditorProps {
  schema?: Schema;
  block?: string;
  appId: string;
}

const AppEditor = ({ schema, block, appId }: AppEditorProps) => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { setDirty } = useWorkspaceLayout();
  const { appConfig, onAppConfigUpdate } = useAppConfig(workspaceId, appId);

  if (!appConfig) return <Loading />;

  if (schema) {
    const s: Schema = {
      type: 'object',
      properties: schema as Schema['properties'],
    };

    return (
      <SchemaForm
        schema={s}
        onChange={() => setDirty(true)}
        onSubmit={() => {
          onAppConfigUpdate;
          setDirty(false);
        }}
        initialValues={appConfig}
      />
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
