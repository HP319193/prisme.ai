import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import {
  BlockProvider,
  Loading,
  Schema,
  SchemaForm,
  SchemaFormDescription,
  useBlock,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useField } from 'react-final-form';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Block from '../Block';
import { usePages } from '../PagesProvider';
import useSchema from '../SchemaForm/useSchema';

export const Development = (props: any) => {
  const { t } = useTranslation('workspaces');
  const {
    config = { url: 'http://localhost:9090/main.js' },
    setConfig,
    ...blockSetup
  } = useBlock();
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
    <BlockProvider config={config.debug} appConfig={{}} {...blockSetup}>
      <div className="group">
        {error || !config.url ? (
          <div className="flex flex-1 justify-center items-center p-2 text-center">
            <WarningOutlined className="self-start mt-1 mr-2 text-2xl" />
            {t('pages.blocks.development.error', { context: error })}
          </div>
        ) : (
          <Block
            url={`${config.url}?${version}`}
            onLoad={(block) =>
              setConfig && setConfig({ ...config, schema: block.schema })
            }
            entityId="dev"
            {...props}
            renderLoading={
              <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
            }
            edit
          />
        )}
        <button
          className="absolute top-2 right-2 invisible group-hover:visible"
          onClick={reload}
        >
          <ReloadOutlined />
        </button>
      </div>
    </BlockProvider>
  );
};

const Debug = (props: any) => {
  const { t } = useTranslation('workspaces');
  const { config: { schema } = {} } = useBlock();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { pages } = usePages();
  const savedSchema = useRef(schema);
  const { extractSelectOptions } = useSchema({
    pages: pages.get(workspaceId),
  });

  useEffect(() => {
    if (schema) {
      savedSchema.current = schema;
    }
  }, [schema]);

  const field = useField(props.name);

  return (
    <SchemaFormDescription
      text={t('pages.blocks.development.settings.block.description')}
    >
      <label className="text-[10px] text-gray">
        {t('pages.blocks.development.settings.block.label')}
      </label>
      <SchemaForm
        schema={schema || savedSchema.current}
        buttons={[]}
        initialValues={field.input.value}
        onChange={field.input.onChange}
        utils={{ extractSelectOptions }}
      />
    </SchemaFormDescription>
  );
};

const schema: Schema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      title: 'pages.blocks.development.settings.url.label',
      description: 'pages.blocks.development.settings.url.description',
    },
    debug: {
      'ui:widget': Debug,
    },
  },
};
Development.schema = schema;
export default Development;
