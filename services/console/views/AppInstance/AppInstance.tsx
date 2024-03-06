import { CodeOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button } from '@prisme.ai/design-system';
import { validateAppInstance } from '@prisme.ai/validation';
import { notification, PageHeader, Segmented, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AppEditor from '../../components/AppEditor';
import HorizontalSeparatedNav from '../../components/HorizontalSeparatedNav';
import IFrameLoader from '../../components/IFrameLoader';
import SourceEdit, {
  ValidationError,
} from '../../components/SourceEdit/SourceEdit';
import { TrackingCategory, useTracking } from '../../components/Tracking';
import getLayout from '../../layouts/WorkspaceLayout';
import AppInstanceProvider, {
  useAppInstance,
} from '../../providers/AppInstanceProvider';
import { useWorkspace } from '../../providers/Workspace';
import { ApiError } from '../../utils/api';
import { generatePageUrl, replaceSilently } from '../../utils/urls';
import useDirtyWarning from '../../utils/useDirtyWarning';
import useLocalizedText from '../../utils/useLocalizedText';
import EditDetails from './EditDetails';

export const AppInstance = () => {
  const { appInstance, documentation, saveAppInstance, saving, uninstallApp } =
    useAppInstance();
  const { workspace } = useWorkspace();
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');
  const { replace } = useRouter();
  const [, { photo }] = Object.entries(workspace.imports || {}).find(
    ([slug]) => slug === appInstance.slug
  ) || [, {}];
  const [value, setValue] = useState(appInstance);
  const [displaySource, setDisplaySource] = useState(false);
  const [mountSource, setMountSource] = useState(true);
  const [viewMode, setViewMode] = useState(documentation ? 0 : 1);
  const [dirty] = useDirtyWarning(appInstance, value);
  const { trackEvent } = useTracking();

  useEffect(() => {
    setValue(appInstance);
  }, [appInstance]);

  const save = useCallback(
    async (newValue = value) => {
      const prevSlug = appInstance.slug;
      try {
        const updated = await saveAppInstance(newValue);
        if (!updated) return null;
        notification.success({
          message: t('apps.save.toast'),
          placement: 'bottomRight',
        });
        const { slug } = updated;
        if (prevSlug !== slug) {
          replaceSilently(`/workspaces/${workspace.id}/apps/${slug}`);
        }
        return updated;
      } catch (e) {
        const { details, error } = e as ApiError;
        const description = (
          <ul>
            {details ? (
              details.map(({ path, message }: any, key: number) => (
                <li key={key}>
                  {t('openapi', {
                    context: message,
                    path: path.replace(/^\.body\./, ''),
                    ns: 'errors',
                  })}
                </li>
              ))
            ) : (
              <li>{t('apps.save.reason', { context: error })}</li>
            )}
          </ul>
        );
        notification.error({
          message: t('apps.save.error'),
          description,
          placement: 'bottomRight',
        });
      }
    },
    [appInstance.slug, saveAppInstance, t, value, workspace.id]
  );
  // Need to get the latest version with the latest value associated
  const saveAfterChange = useRef(save);
  useEffect(() => {
    saveAfterChange.current = save;
  }, [save]);

  const saveDetails = useCallback(
    async ({ slug = '', disabled }: Prismeai.AppInstance) => {
      trackEvent({
        name: 'Save Details',
        action: 'click',
      });
      const { config, ...prevValue } = value;
      const newValue = {
        ...prevValue,
        slug,
        disabled,
      };
      setValue(newValue);
      try {
        // Force source to be reloaded
        setMountSource(false);
        await save(newValue);
        setTimeout(() => setMountSource(true), 10);
        notification.success({
          message: t('apps.saveSuccess'),
          placement: 'bottomRight',
        });
      } catch (e) {
        const error: any = e;
        if (error.details) {
          notification.error({
            message: t('apps.save.error', {
              context: Object.keys(error.details || {})[0],
            }),
            placement: 'bottomRight',
          });
          return error.details;
        }
        throw e;
      }
    },
    [save, t, trackEvent, value]
  );

  const onDelete = useCallback(() => {
    replace(`/workspaces/${workspace.id}`);
    uninstallApp();
  }, [replace, uninstallApp, workspace.id]);

  const showSource = useCallback(() => {
    trackEvent({
      name: `${displaySource ? 'Hide' : 'Show'} source code`,
      action: 'click',
    });
    setDisplaySource(!displaySource);
  }, [displaySource, trackEvent]);

  const mergeSource = useCallback(
    (source: any) => ({
      ...value,
      ...source,
    }),
    [value]
  );
  const [validationError, setValidationError] = useState<ValidationError>();
  const validateSource = useCallback(
    (json: any) => {
      const isValid = validateAppInstance(mergeSource(json));
      const [error] = validateAppInstance.errors || [];
      setValidationError(error as ValidationError);
      return isValid;
    },
    [mergeSource]
  );

  const source = useMemo(() => {
    const { appSlug, config = {}, ...source } = value;
    return { ...source, config: config && config.value };
  }, [value]);
  const setSource = useCallback(
    (source: any) => {
      setValue(mergeSource(source));
    },
    [mergeSource]
  );

  return (
    <>
      <PageHeader
        className="h-[4rem] flex items-center"
        title={
          <HorizontalSeparatedNav>
            <HorizontalSeparatedNav.Separator>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  className="mr-2 h-[1.6rem]"
                  alt={appInstance.slug}
                />
              )}
              <span className="pr-page-title">
                <div className="text-base font-bold max-w-[35vw]">
                  {appInstance.slug}
                </div>
              </span>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip title={t('apps.details.title')} placement="bottom">
                <EditDetails
                  value={value}
                  onSave={saveDetails}
                  onDelete={onDelete}
                  context="apps"
                  key={appInstance.slug}
                />
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip title={t('apps.source.help')} placement="bottom">
                <button
                  className="flex flex-row focus:outline-none items-center"
                  onClick={showSource}
                >
                  <span
                    className={`flex mr-2 ${
                      displaySource ? 'text-accent' : ''
                    }`}
                  >
                    <CodeOutlined width="1.2rem" height="1.2rem" />
                  </span>
                  <span className="flex">
                    {displaySource
                      ? t('apps.source.close')
                      : t('apps.source.label')}
                  </span>
                </button>
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
          </HorizontalSeparatedNav>
        }
        extra={[
          displaySource ? (
            <Button
              key="save"
              onClick={() => save()}
              className="!flex flex-row"
              variant="primary"
              disabled={!dirty || saving}
            >
              {t('apps.save.label')}
            </Button>
          ) : (
            documentation && (
              <div key="doc">
                <div className="ml-3">
                  <Segmented
                    key="nav"
                    options={[
                      {
                        label: t('apps.doc'),
                        value: 0,
                        icon: <EyeOutlined />,
                      },
                      {
                        label: t('apps.config'),
                        value: 1,
                        icon: <EditOutlined />,
                      },
                    ]}
                    onChange={(v) => {
                      trackEvent({
                        name: `Show ${
                          v === 0 ? 'Documentation' : 'Configuration'
                        } tab`,
                        action: 'click',
                      });
                      setViewMode(+v);
                    }}
                    className="pr-segmented-accent"
                  />
                </div>
              </div>
            )
          ),
        ]}
      />
      <Head>
        <title>
          [{localize(workspace.name)}]{' '}
          {t('page_title', {
            elementName: localize(appInstance.slug),
          })}
        </title>
      </Head>
      <div className="relative flex flex-1 h-full overflow-y-auto">
        {documentation && documentation.workspaceSlug && documentation.slug && (
          <IFrameLoader
            src={generatePageUrl(
              documentation.workspaceSlug,
              documentation.slug
            )}
            className="flex flex-1"
          />
        )}
        {viewMode === 1 && (
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white">
            <AppEditor
              schema={appInstance.config.schema}
              block={appInstance.config.block}
              appId={appInstance.slug!}
              key={appInstance.slug}
            />
          </div>
        )}

        <SourceEdit
          value={source}
          onChange={setSource}
          onSave={() => save()}
          visible={displaySource}
          mounted={mountSource}
          validate={validateSource}
          error={validationError}
        />
      </div>
    </>
  );
};

const AppInstanceWithProvider = () => {
  const {
    query: { appId },
  } = useRouter();
  const { workspace, events } = useWorkspace();

  return (
    <TrackingCategory category="Apps">
      <AppInstanceProvider
        id={`${appId}`}
        workspaceId={workspace.id}
        events={events}
      >
        <AppInstance />
      </AppInstanceProvider>
    </TrackingCategory>
  );
};
AppInstanceWithProvider.getLayout = getLayout;
export default AppInstanceWithProvider;
