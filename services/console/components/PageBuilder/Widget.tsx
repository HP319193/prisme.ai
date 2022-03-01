import * as React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import { usePageBuilder } from './context';
import Loading from '../Loading';
import Block from '../Block';
interface WidgetProps {
  url: string;
  id: string;
}
export const Widget = ({ url, id }: WidgetProps) => {
  const { t } = useTranslation('workspaces');
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="flex m-4 relative"
      style={{
        resize: 'vertical',
        overflow: 'auto',
      }}
    >
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
