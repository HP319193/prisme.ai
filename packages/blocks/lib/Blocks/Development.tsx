import '../i18n';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import tw from '../tw';
import { BlockLoader } from '../BlockLoader';
import { useBlock } from '../Provider';
import { withI18nProvider } from '../i18n';
import { useBlocks } from '../Provider/blocksContext';

export const Development = (props: any) => {
  const { t } = useTranslation('workspaces');
  const {
    config = { url: 'http://localhost:9090/main.js' },
    setConfig,
    ...blockSetup
  } = useBlock();
  const {
    components: { Loading },
  } = useBlocks();
  const [error, setError] = useState<string | false>(false);
  const [version, setVersion] = useState(Math.random());

  const reload = useCallback(() => {
    setVersion(Math.random());
  }, []);

  useEffect(() => {
    const check = async () => {
      if (!config.url) {
        setError('url');
      }
      try {
        const res = await fetch(config.url);
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        setError(false);
      } catch (e) {
        setError('loading');
      }
    };
    check();
  }, [config]);

  return (
    <div className={tw`group`}>
      {error || !config.url ? (
        <div
          className={tw`flex flex-1 justify-center items-center p-2 text-center`}
        >
          <WarningOutlined className={tw`self-start mt-1 mr-2 text-2xl`} />
          {t('development.error', { context: error })}
        </div>
      ) : (
        <BlockLoader
          config={config.debug}
          appConfig={{}}
          url={`${config.url}?${version}`}
          {...props}
          renderLoading={<Loading />}
          edit
          {...blockSetup}
        />
      )}
      <button
        className={tw`absolute top-2 right-2 invisible group-hover:visible`}
        onClick={reload}
      >
        <ReloadOutlined />
      </button>
    </div>
  );
};
export default withI18nProvider(Development);
