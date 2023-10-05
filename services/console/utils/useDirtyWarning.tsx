import { WarningOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import equal from 'fast-deep-equal';

export const useDirtyWarning = <T,>(original: T, newValue: T) => {
  const { t } = useTranslation('workspaces');
  const router = useRouter();
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!equal(original, newValue)) {
      setDirty(true);
    }
  }, [newValue, original]);
  useEffect(() => {
    setDirty(false);
  }, [original]);

  useEffect(() => {
    const onRouteChangeStart = (url: string) => {
      if (!dirty) return;
      Modal.confirm({
        icon: <WarningOutlined />,
        content: t('workspace.dirtyWarning'),
        onOk: () => {
          setDirty(false);
          setTimeout(() => router.push(url), 1);
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
