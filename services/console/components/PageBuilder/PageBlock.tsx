import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import { usePageBuilder } from './context';
import {
  BlockProvider,
  Button,
  Loading,
  Schema,
  StretchContent,
  Tooltip,
  useBlock,
} from '@prisme.ai/design-system';
import Block from '../Block';
import { SettingOutlined } from '@ant-design/icons';
import { Fragment, useCallback, useMemo, useState } from 'react';
import Settings from './Settings';
import useLocalizedText from '../../utils/useLocalizedText';

interface PageBlockProps {
  url?: string;
  component?: Function;
  id: string;
  title: string | React.ReactNode;
  workspaceId: string;
  appInstance?: string;
  editSchema?: Schema['properties'];
}
export const PageBlock = ({
  url,
  component: Component,
  id,
  title,
  workspaceId,
  appInstance,
  editSchema,
}: PageBlockProps) => {
  const { t } = useTranslation('workspaces');
  const { localizeSchemaForm } = useLocalizedText();
  const { removeBlock } = usePageBuilder();
  const { buttons } = useBlock();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const schema: Schema | undefined = useMemo(() => {
    if (!editSchema) return;
    const schema: Schema = editSchema.type
      ? editSchema
      : {
          type: 'object',
          properties: editSchema,
        };
    return localizeSchemaForm(schema);
  }, [editSchema, localizeSchemaForm]);

  return (
    <div
      className="flex m-4 relative 
          flex-col
          surface-section
          border-graph-border
          bg-white
          border-2
          rounded
          overflow-hidden"
    >
      <div className="flex flex-1 border-graph-border bg-graph-background border-b-2 justify-between p-2">
        {title}
        <div className="flex flex-row">
          {buttons &&
            buttons.map((button, index) => (
              <Fragment key={index}>{button}</Fragment>
            ))}
          <div className="ml-2">
            <Tooltip
              title={t('pages.blocks.settings.toggle', {
                context: settingsVisible ? 'off' : 'on',
              })}
              placement="left"
            >
              <Button onClick={() => setSettingsVisible(!settingsVisible)}>
                <SettingOutlined />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      <StretchContent visible={settingsVisible}>
        <Settings removeBlock={() => removeBlock(id)} schema={schema} />
      </StretchContent>
      {Component && <Component edit />}
      {url && (
        <Block
          url={url}
          entityId={id}
          token={`${api.token}`}
          workspaceId={workspaceId}
          appInstance={appInstance}
          renderLoading={
            <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
          }
          edit
        />
      )}
    </div>
  );
};

const PageBlockWithProvider = (props: PageBlockProps) => {
  const { page, setBlockConfig } = usePageBuilder();
  const config = useMemo(
    () => ((page.blocks || []).find(({ key }) => props.id === key) || {}).config || {},
    [page.blocks, props.id]
  );

  const [appConfig, setAppConfig] = useState<any>();

  const setConfigHandler = useCallback(
    (config: any) => {
      setBlockConfig(props.id, config);
    },
    [props.id, setBlockConfig]
  );

  const setAppConfigHandler = useCallback(
    (newConfig: any) =>
      setAppConfig((config: any) => ({
        ...config,
        ...newConfig,
      })),
    []
  );

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfigHandler}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfigHandler}
    >
      <PageBlock {...props} />
    </BlockProvider>
  );
};

export default PageBlockWithProvider;
