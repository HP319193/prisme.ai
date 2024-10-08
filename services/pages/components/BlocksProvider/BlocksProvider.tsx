import { BlocksProvider as Provider } from '@prisme.ai/blocks';
import { FC, useCallback, useMemo } from 'react';
import externals from '../../../console/utils/externals';
import { useWorkspace } from '../Workspace';
import api, { HTTPError } from '../../../console/utils/api';
import { getPreview } from './getPreview';
import Link from './Link';
import DownIcon from './DownIcon';
import Loading from './Loading';
import BlockLoader from '../Page/BlockLoader';
import SchemaForm from './SchemaForm';
import { useTranslation } from 'next-i18next';
import { useUser } from '../../../console/components/UserProvider';
import { original } from '../Page/computeBlocks';
import Head from 'next/head';
import parser from 'html-react-parser';

const HeadFromString = ({ children }: { children: string }) => {
  return <Head>{parser(children)}</Head>;
};

export const BlocksProvider: FC = ({ children }) => {
  const { id } = useWorkspace();
  const { user } = useUser();
  const {
    t,
    i18n: { language },
  } = useTranslation('common');
  const { initAuthentication } = useUser();
  const uploadFile = useCallback(
    async (
      file: string,
      opts?: {
        expiresAfter?: number;
        public?: boolean;
        shareToken?: boolean;
      }
    ) => {
      if (!id) return file;
      // Delete these lines as soon as we migrated existing blocks using legacy syntax
      if (typeof opts === 'number') {
        opts = {
          expiresAfter: opts,
        };
      }
      const [{ url, mimetype, name }] = await api
        .workspaces(id)
        .uploadFiles(file, opts);

      return {
        value: url,
        preview: getPreview(mimetype, url),
        label: name,
      };
    },
    [id]
  );

  const auth = useMemo(() => {
    return {
      getSigninUrl: async ({ redirect = '' } = {}) => {
        if (!user || user.authData?.anonymous) {
          return initAuthentication({ redirect });
        }

        return redirect;
      },
      getSignupUrl: async ({ redirect = '' } = {}) => {
        return `/signup${redirect ? `?redirect=${redirect}` : ''}`;
      },
    };
  }, [initAuthentication, user]);

  const changeBlockConfig = useCallback((_block, newConfig) => {
    const { [original]: block = _block } = _block || {};
    return {
      ...block,
      ...newConfig,
    };
  }, []);

  const locales = useMemo(
    () => ({
      addItem: t('form.addItem'),
      addProperty: t('form.addProperty'),
      propertyKey: t('form.propertyKey'),
      propertyValue: t('form.propertyValue'),
      removeItem: t('form.removeItem'),
      removeProperty: t('form.removeProperty'),
      uploadLabel: t('form.uploadLabel'),
      uploadingLabel: t('form.uploadingLabel'),
      uploadRemove: t('form.uploadRemove'),
    }),
    [t]
  );

  const fetchWorkspaceOnly = useCallback<typeof globalThis.fetch>(
    async (...args) => {
      const [url] = args;
      if (typeof url !== 'string')
        return new Response(
          'You can fetch only your Workspace automations endpoints.',
          {
            status: 403,
            statusText:
              'You can fetch only your Workspace automations endpoints.',
          }
        );
      const automation = api.getAutomationFromUrl(id, url);
      if (!automation)
        return new Response(
          'You can fetch only your Workspace automations endpoints.',
          {
            status: 403,
            statusText:
              'You can fetch only your Workspace automations endpoints.',
          }
        );
      try {
        return new Response(
          JSON.stringify(await api.callAutomation(id, automation)),
          {
            status: 200,
          }
        );
      } catch (e) {
        const { message } = e as HTTPError;
        return new Response(JSON.stringify(message), {
          status: (e as HTTPError).code,
        });
      }
    },
    [id]
  );

  return (
    <Provider
      externals={externals}
      components={{
        Link,
        Loading,
        DownIcon,
        SchemaForm: (props: any) => <SchemaForm {...props} locales={locales} />,
        Head: HeadFromString,
      }}
      utils={{
        uploadFile,
        BlockLoader,
        auth,
        changeBlockConfig,
        fetchWorkspaceOnly,
      }}
      language={language}
    >
      {children}
    </Provider>
  );
};

export default BlocksProvider;
