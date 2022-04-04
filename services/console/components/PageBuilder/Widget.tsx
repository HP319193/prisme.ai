import * as React from 'react';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import { usePageBuilder } from './context';
import {
  BlockProvider,
  Button,
  Loading,
  Tooltip,
  useBlock,
} from '@prisme.ai/design-system';
import Block from '../Block';
import { DeleteOutlined } from '@ant-design/icons';

interface WidgetProps {
  url?: string;
  component?: Function;
  id: string;
  title: string | React.ReactNode;
  workspaceId: string;
  appInstance?: string;
}
export const Widget = ({
  url,
  component: Component,
  id,
  title,
  workspaceId,
  appInstance,
}: WidgetProps) => {
  const { t } = useTranslation('workspaces');
  const { removeWidget } = usePageBuilder();
  const { buttons } = useBlock();

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
              <React.Fragment key={index}>{button}</React.Fragment>
            ))}
          <div className="ml-2">
            <Tooltip title={t('pages.widgets.remove')} placement="left">
              <Button onClick={() => removeWidget(id)}>
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      {Component && <Component />}
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
        />
      )}
      <Tooltip title={t('pages.widgets.resize')}>
        <div
          style={{
            width: '20px',
            height: '20px',
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}
        />
      </Tooltip>
    </div>
  );
};

const WidgetWithBlock = (props: WidgetProps) => {
  // TODO change with dsul
  const [config, setConfig] = React.useState<any>();
  const [appConfig, setAppConfig] = React.useState<any>();

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
    >
      <Widget {...props} />
    </BlockProvider>
  );
};

export default WidgetWithBlock;
