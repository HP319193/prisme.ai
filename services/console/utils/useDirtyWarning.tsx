import { WarningOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import equal from 'fast-deep-equal';
import clone from 'rfdc';

export const useDirtyWarning = <T,>(original: T, newValue: T) => {
  const { t } = useTranslation('workspaces');
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const navigating = useRef(false);
  const originalValue = useRef(clone({ proto: false })(original));

  useEffect(() => {
    if (!navigating.current && !equal(originalValue.current, newValue)) {
      setDirty(true);
    }
  }, [newValue, original]);

  useEffect(() => {
    const newOriginal = clone({ proto: false })(original);
    if (equal(newOriginal, originalValue.current)) return;
    originalValue.current = newOriginal;
    setDirty(false);
  }, [original]);

  useEffect(() => {
    const onRouteChangeStart = (url: string) => {
      if (!dirty) return;
      Modal.confirm({
        icon: <WarningOutlined />,
        content: t('workspace.dirtyWarning'),
        onOk: () => {
          navigating.current = true;
          setDirty(false);
          setTimeout(() => {
            router.push(url);
            navigating.current = false;
          }, 1);
        },
        okText: t('workspace.dirtyOk'),
        cancelText: t('cancel', { ns: 'common' }),
      });
      throw 'wait for warning';
    };
    router.events.on('routeChangeStart', onRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
    };
  }, [dirty, router, t]);

  return [dirty, setDirty] as [typeof dirty, typeof setDirty];
};

export default useDirtyWarning;
