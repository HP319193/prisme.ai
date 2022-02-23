import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import { usePageBuilder } from './context';
import Loading from '../Loading';
interface WidgetProps {
  url: string;
  id: string;
  height?: number;
}
export const Widget = ({ url, id, height = 200 }: WidgetProps) => {
  const { t } = useTranslation('workspaces');
  const { resizeWidget } = usePageBuilder();
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const handleLoad = useCallback(
    (e) => {
      setLoading(false);
      e.target.contentWindow.postMessage(
        {
          source: 'prisme.ai',
          token: api.token,
          id,
        },
        '*'
      );
    },
    [id]
  );

  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        resizeWidget(id, entry.contentRect.height);
      }
    });
    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [id, resizeWidget]);

  return (
    <div
      ref={ref}
      className="flex m-4 relative"
      style={{ resize: 'vertical', overflow: 'auto', height: `${height}px` }}
    >
      {loading && (
        <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
      )}
      <iframe
        src={url}
        onLoad={handleLoad}
        className="flex"
        style={{
          width: '100%',
          height: '100%',
        }}
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
