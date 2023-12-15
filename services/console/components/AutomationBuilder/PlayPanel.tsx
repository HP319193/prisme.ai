import { CloseCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { Loading, Popover, Schema, Tooltip } from '@prisme.ai/design-system';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useAutomation } from '../../providers/Automation';
import { useWorkspace } from '../../providers/Workspace';
import api from '../../utils/api';
import Storage from '../../utils/Storage';
import { CodeEditorInline } from '../CodeEditor/lazy';
import worskpaceSvg from '../../icons/workspace.svg';
import components from '../SchemaForm/schemaFormComponents';
import PlayIcon from '../../icons/play.svgr';
import { useTracking } from '../Tracking';
import useLocalizedText from '../../utils/useLocalizedText';
import copy from '../../utils/Copy';
import SchemaForm from '../SchemaForm/SchemaForm';
import ItemsGroup from '../Navigation/ItemsGroup';

interface PreviewResultProps {
  result: string;
  link: string;
}
const PreviewResult = ({ result, link }: PreviewResultProps) => {
  const { t } = useTranslation('workspaces');
  const [open, setOpen] = useState(true);
  const prettyPreview = useMemo(() => {
    setOpen(false);
    if (typeof result === 'string') {
      if (result.match(/^http/)) {
        if (result.match(/\.(png|jpeg|jpg|png|svg)$/)) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={result} alt="" />;
        }
        return <a href={result}>{result}</a>;
      }
    }
    setOpen(true);
    return null;
  }, [result]);
  const details = (
    <>
      <CodeEditorInline
        readOnly
        value={result}
        mode="json"
        className="!flex-auto"
      />
      <Link href={link}>
        <a className="mt-4 text-right">{t('automations.play.activity')}</a>
      </Link>
    </>
  );
  if (prettyPreview) {
    return (
      <>
        {prettyPreview}
        <ItemsGroup
          open={open}
          onClick={() => setOpen(!open)}
          title={t('automations.play.details')}
        >
          {details}
        </ItemsGroup>
      </>
    );
  }
  return details;
};

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
  const { trackEvent } = useTracking();
  const { localizeSchemaForm } = useLocalizedText();

  const saveValues = useCallback(
    (values: any) => {
      setValues(values);
      Storage.set(lsKey, values);
    },
    [lsKey]
  );

  const run = useCallback(async () => {
    trackEvent({
      name: 'Run automation in Play panel',
      action: 'click',
    });
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
  }, [automation.slug, trackEvent, values, wId]);

  const schema = useMemo(
    () =>
      localizeSchemaForm({
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
      localizeSchemaForm,
      t,
    ]
  );

  const hasParam = Object.keys(schema.properties || {}).length > 0;

  const copyCurl = useCallback(() => {
    trackEvent({
      name: 'Copy automation play as cURL',
      action: 'click',
    });
    const payload = JSON.stringify(values);
    const cmd = `curl '${api.host}/workspaces/${wId}/test/${automation.slug}' \\
  -H 'content-type: application/json' \\
  -H 'authorization: Bearer ${api.token}' \\
  --data-raw '{"payload": ${payload}}' \\
  --compressed`;
    copy(cmd);
  }, [automation.slug, trackEvent, values, wId]);

  return (
    <div className="flex flex-row flex-1 min-w-[70vw]">
      {hasParam && (
        <div className="flex flex-col flex-1">
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
      <div className="flex flex-col w-[50%] mr-2">
        <div className="flex flex-row justify-between">
          <div className="font-bold">{t('automations.play.results')}</div>
          <div className="flex flex-row">
            <Tooltip title={t('automations.play.curl.copy')}>
              <button
                className="flex items-center mr-2 text-gray"
                type="button"
                onClick={copyCurl}
              >
                <CopyOutlined />
              </button>
            </Tooltip>
            <button
              className={`flex items-center ${
                running ? 'text-gray' : 'text-accent'
              }`}
              onClick={run}
              disabled={running}
            >
              <PlayIcon className="mr-2" />
              {t('automations.play.label')}
            </button>
          </div>
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
              <PreviewResult
                result={result}
                link={`/workspaces/${wId}?source.correlationId=${correlationId}`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const PlayPanel = (props: any) => {
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();

  return (
    <Popover
      title={({ setOpen }) => (
        <div className="flex flex-1 justify-between -m-6">
          {t('automations.play.title')}
          <button onClick={() => setOpen(false)}>
            <CloseCircleOutlined />
          </button>
        </div>
      )}
      destroyTooltipOnHide
      content={PlayView}
      placement="bottom"
      overlayClassName="pr-popover-arrow-right"
      onOpenChange={(open) =>
        trackEvent({
          name: `${open ? 'Open' : 'Close'} Play Panel`,
          action: 'click',
        })
      }
      {...props}
    >
      <button className="flex text-4xl text-accent focus:outline-none">
        <PlayIcon />
      </button>
    </Popover>
  );
};

export default PlayPanel;
