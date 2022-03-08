import * as React from 'react';
import { memo, useRef } from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import { usePageBuilder } from './context';
import { Loading } from '@prisme.ai/design-system';
import Block from '../Block';
import useHover from '@react-hook/hover';
import { CloseCircleOutlined } from '@ant-design/icons';

interface WidgetProps {
  url: string;
  id: string;
  title: string | React.ReactNode;
}
export const Widget = ({ url, id, title }: WidgetProps) => {
  const { t } = useTranslation('workspaces');
  const { removeWidget } = usePageBuilder();
  const ref = useRef<HTMLDivElement>(null);
  const isHover = useHover(ref);

  return (
    <div
      ref={ref}
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
        <Tooltip title={t('pages.widgets.remove')} placement="left">
          <button
            className={`${isHover ? 'opacity-1' : 'opacity-0'}`}
            onClick={() => removeWidget(id)}
          >
            <CloseCircleOutlined />
          </button>
        </Tooltip>
      </div>
      <Block
        url={url}
        entityId={id}
        token={`${api.token}`}
        renderLoading={
          <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
        }
      />
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

export default memo(Widget);
