import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ProductLayoutProps } from './types';

export const Assistant = ({
  url,
  visible,
}: NonNullable<ProductLayoutProps['assistant']>) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  const ctnRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);
  const initialWidth = useRef('');
  const startResize = useCallback(() => {
    resizing.current = true;
  }, []);
  const resetResize = useCallback(() => {
    if (!ctnRef.current) return;
    ctnRef.current.style.setProperty('--assistant-width', initialWidth.current);
  }, []);
  useEffect(() => {
    if (!ctnRef.current) return;
    initialWidth.current = getComputedStyle(ctnRef.current).getPropertyValue(
      '--assistant-width'
    );
  }, []);
  useEffect(() => {
    const listener = () => {
      resizing.current = false;
    };
    window.addEventListener('mouseup', listener);

    return () => {
      window.removeEventListener('mouseup', listener);
    };
  }, []);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ctnRef.current || !resizing.current) return;
      ctnRef.current.style.setProperty(
        '--assistant-width',
        `${
          +(getComputedStyle(ctnRef.current)
            .getPropertyValue('--assistant-width')
            .match(/[0-9]+/) || [0])[0] - e.movementX
        }px`
      );
    };
    window.addEventListener('mousemove', listener);

    return () => {
      window.removeEventListener('mousemove', listener);
    };
  }, []);

  if (!url) return null;

  return (
    <div
      ref={ctnRef}
      className={`product-layout-assistant-ctn ${visible ? 'visible' : ''}`}
    >
      <button
        className="product-layout-assistant__handle"
        onMouseDown={startResize}
        onDoubleClick={resetResize}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
          <path
            fill="currentColor"
            d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32L64 64zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384z"
          />
        </svg>
      </button>
      {mounted && (
        <iframe src={url} className="product-layout-assistant"></iframe>
      )}
    </div>
  );
};

export default Assistant;
