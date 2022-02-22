import {
  ReactEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
interface WidgetProps {
  url: string;
  id: string;
}
export const Widget = ({ url, id }: WidgetProps) => {
  const { t } = useTranslation('workspaces');
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const handleLoad = useCallback((e) => {
    setLoading(false);
    e.target.contentWindow.postMessage(
      {
        source: 'prisme.ai',
        token: api.token,
        id,
      },
      '*'
    );
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        console.log('change height', entry.contentRect.height);
      }
    });
    resizeObserver.observe(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      className="flex m-4 relative"
      style={{ resize: 'vertical', overflow: 'auto' }}
    >
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

export default Widget;
