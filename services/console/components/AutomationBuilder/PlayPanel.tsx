import { CloseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Loading, Popover, Schema, SchemaForm } from '@prisme.ai/design-system';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useAutomation } from '../../providers/Automation';
import { useWorkspace } from '../../providers/Workspace';
import api from '../../utils/api';
import Storage from '../../utils/Storage';
import { CodeEditorInline } from '../CodeEditor/lazy';
import worskpaceSvg from '../../icons/workspace.svg';
import { Result } from 'antd';
import components from '../SchemaForm/schemaFormComponents';

const PlayView = () => {
  const {
    workspace: { id: wId },
  } = useWorkspace();
  const { automation } = useAutomation();
  const [running, setRunning] = useState(false);
  const lsKey = `__run_automation_with_${automation.slug}`;
  const [values, setValues] = useState(Storage.get(lsKey));
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [correlationId, setCorrelationId] = useState('');
  const { t } = useTranslation('workspaces');

  const saveValues = useCallback(
    (values: any) => {
      setValues(values);
      Storage.set(lsKey, values);
    },
    [lsKey]
  );

  const run = useCallback(async () => {
    if (!automation.slug) return;
    setRunning(true);
    setResult('');
    setError('');
    setCorrelationId('');
    try {
      const res = await api.testAutomation({
        workspaceId: wId,
        automation: automation.slug,
        payload: values,
      });
      if (typeof res === 'string') {
        const { ['x-correlation-id']: correlationId = '' } =
          api.lastReceivedHeaders || {};
        setCorrelationId(correlationId);
        setResult(res);
      } else {
        const {
          headers: { ['x-correlation-id']: correlationId = '' } = {},
          ...result
        } = res;
        setCorrelationId(correlationId);
        setResult(result);
      }
    } catch (e) {
      setError((e as Error).message);
    }

    setRunning(false);
  }, [automation.slug, values, wId]);

  const schema = useMemo(
    () =>
      ({
        type: 'object',
        properties: {
          ...automation.arguments,
          ...(automation.when?.endpoint
            ? {
                query: {
                  title: t('automations.play.query.label'),
                  description: t('automations.play.query.description'),
                },
                body: {
                  title: t('automations.play.body.label'),
                  description: t('automations.play.body.description'),
                },
              }
            : {}),
          ...(automation.when?.events?.length || 0 > 0
            ? {
                payload: {
                  title: t('automations.play.payload.label'),
                  description: t('automations.play.payload.description'),
                },
              }
            : {}),
        },
      } as Schema),
    [
      automation.arguments,
      automation.when?.endpoint,
      automation.when?.events?.length,
      t,
    ]
  );

  const hasParam = Object.keys(schema.properties || {}).length > 0;

  return (
    <div className="flex flex-row flex-1">
      {hasParam && (
        <div className="flex flex-col order-1">
          <div className="font-bold">{t('automations.play.parameters')}</div>
          <SchemaForm
            schema={schema}
            onSubmit={run}
            onChange={saveValues}
            initialValues={values}
            buttons={[
              <button type="submit" key="submit" className="hidden"></button>,
            ]}
            components={components}
            initialFieldObjectVisibility={false}
          />
        </div>
      )}
      <div className="flex flex-col w-[20rem] mr-2">
        <div className="flex flex-row justify-between">
          <div className="font-bold">{t('automations.play.results')}</div>
          <button
            className={`flex items-center ${
              running ? 'text-gray' : 'text-accent'
            }`}
            onClick={run}
            disabled={running}
          >
            <PlayCircleOutlined className="mr-2" />
            {t('automations.play.label')}
          </button>
        </div>

        <div
          className={`flex flex-1 flex-col items-${
            !running && !result && !error ? 'center' : 'stretch'
          } justify-center text-gray min-h-[20vh]`}
        >
          {!running && !result && !error && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...worskpaceSvg} width="100px" alt="" className="mb-8" />
              <Trans t={t} i18nKey="automations.play.empty">
                Lancer votre automation ici
                <button onClick={run} className="text-accent underline">
                  Démarrer
                </button>
              </Trans>
            </>
          )}
          {running && <Loading />}
          {!running && error && (
            <div className="flex flex-col text-center">
              <div className="flex justify-center text-error text-4xl m-2">
                <CloseCircleOutlined />
              </div>
              <div className="text-base">{error}</div>
              <button onClick={run}>Try again</button>
            </div>
          )}
          {!running && result && (
            <>
              <CodeEditorInline readOnly value={result} mode="json" />
              <Link
                href={`/workspaces/${wId}?source.correlationId=${correlationId}`}
              >
                <a className="mt-4 text-right">
                  {t('automations.play.activity')}
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const PlayPanel = (props: any) => {
  const { t } = useTranslation('workspaces');
  return (
    <Popover
      title={({ setOpen }) => (
        <div className="flex flex-1 justify-between">
          {t('automations.play.title')}
          <button onClick={() => setOpen(false)}>
            <CloseCircleOutlined />
          </button>
        </div>
      )}
      destroyTooltipOnHide
      content={PlayView}
      placement="bottom"
      overlayClassName="min-w-[40rem] pr-popover-arrow-right"
      {...props}
    >
      <button className="flex text-4xl text-green-500 focus:outline-none">
        <PlayCircleOutlined />
      </button>
    </Popover>
  );
};

export default PlayPanel;
