import { Modal, notification, Schema } from '@prisme.ai/design-system';
import { PageHeader, Segmented, Tooltip } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import getLayout from '../layouts/WorkspaceLayout';
import { useApps } from '../components/AppsProvider';
import useLocalizedText from '../utils/useLocalizedText';
import EditDetails from '../layouts/EditDetails';
import AppEditor from '../components/AppEditor';
import EditableTitle from '../components/AutomationBuilder/EditableTitle';
import getConfig from 'next/config';
import IFrameLoader from '../components/IFrameLoader';
import HorizontalSeparatedNav from '../components/HorizontalSeparatedNav';
import { useWorkspace } from '../providers/Workspace';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

interface AppsProps extends Prismeai.DetailedAppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const Apps = ({}: AppsProps) => {
  const { workspace } = useWorkspace();
  // TODO refacto this shit
  const { appInstances, saveAppInstance } = useApps();
  const { localize } = useLocalizedText();
  const [viewMode, setViewMode] = useState(0);

  const [currentApp, setCurrentApp] = useState<Prismeai.DetailedAppInstance>();

  const {
    push,
    query: { appId },
  } = useRouter();

  useEffect(() => {
    if (!appInstances) return;
    const workspaceApps = appInstances.get(workspace.id);
    if (!workspaceApps) return;

    const currentApp = workspaceApps.find(
      (appInstance) => appInstance.slug === appId
    );
    setCurrentApp(currentApp);
    setViewMode(currentApp?.documentation ? 0 : 1);
  }, [appId, appInstances, workspace.id]);

  const { photo, config: { schema, block } = {} } = (currentApp || {
    config: {},
  }) as Prismeai.DetailedAppInstance;

  // TODO move to AppProvider
  //const { uninstallApp } = useWorkspaces();
  const uninstallApp = useCallback(() => {
    console.log('uninstallApp');
  }, []);
  const { t } = useTranslation('workspaces');

  const onDelete = useCallback(() => {
    if (typeof appId !== 'string') return;

    Modal.confirm({
      icon: <DeleteOutlined />,
      content: t('apps.uninstall', { appName: appId }),
      onOk: () => {
        push(`/workspaces/${workspace.id}`);
        //uninstallApp(workspace.id, appId);
      },
      okText: t('apps.uninstallConfirm', { appName: appId }),
    });
  }, [appId, push, t, /*uninstallApp, */ workspace.id]);

  const [value, setValue] = useState<{
    slug: string;
    appName: Prismeai.LocalizedText;
    disabled: boolean;
  }>();

  useEffect(() => {
    if (!currentApp) return;
    const { slug = '', appName = '', disabled = false } = currentApp;
    setValue({
      slug,
      appName,
      disabled,
    });
  }, [currentApp]);

  const updateDetails = useCallback(
    async ({ slug = '', appName = '', disabled }: Prismeai.AppInstance) => {
      if (!value || !currentApp || !currentApp.slug) return;
      const newValue = {
        appName,
        slug,
        disabled: !!disabled,
      };
      setValue(newValue);
      try {
        await saveAppInstance(workspace.id, currentApp.slug, newValue);
        push(`/workspaces/${workspace.id}/apps/${slug}`);
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
    [currentApp, push, saveAppInstance, t, value, workspace.id]
  );

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        appName: {
          type: 'localized:string',
          title: t('apps.details.appName.label'),
        },
        slug: {
          type: 'string',
          title: t('apps.details.slug.label'),
        },
        disabled: {
          type: 'boolean',
          title: t('apps.details.disabled.label'),
          description: t('apps.details.disabled.description'),
        },
      },
    }),
    [t]
  );

  const docPage = useMemo(() => {
    if (!currentApp?.documentation) return;
    const { workspaceSlug, slug } = currentApp.documentation;
    return `${window.location.protocol}//${workspaceSlug}${PAGES_HOST}/${slug}`;
  }, [currentApp]);
  console.log({ docPage });
  if (typeof appId !== 'string' || !currentApp) return null;

  return (
    <>
      <PageHeader
        className="h-[4rem] flex items-center"
        title={
          <HorizontalSeparatedNav>
            <HorizontalSeparatedNav.Separator>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} className="mr-2 h-[1.6rem]" alt={appId} />
              )}
              <span className="pr-page-title">
                <EditableTitle
                  value={currentApp.appName || ''}
                  onChange={(appName) =>
                    setCurrentApp({
                      ...currentApp,
                      appName,
                    })
                  }
                  onEnter={(appName) =>
                    updateDetails({
                      ...currentApp,
                      appName,
                    })
                  }
                  className="text-base font-bold max-w-[35vw]"
                />
              </span>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip
                title={t('details.title', { context: 'apps' })}
                placement="bottom"
              >
                <EditDetails
                  schema={detailsFormSchema}
                  value={{ ...value }}
                  onSave={updateDetails}
                  onDelete={onDelete}
                  context="apps"
                  key={currentApp.slug}
                />
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
          </HorizontalSeparatedNav>
        }
        extra={[
          currentApp?.documentation && (
            <div>
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
                  onChange={(v) => setViewMode(+v)}
                  className="pr-segmented-accent"
                />
              </div>
            </div>
          ),
        ]}
      />
      <Head>
        <title>
          {t('page_title', {
            elementName: localize(currentApp.appName),
          })}
        </title>
      </Head>
      <div className="relative flex flex-1 bg-blue-200 h-full overflow-y-auto">
        {docPage && <IFrameLoader src={docPage} className="flex flex-1" />}
        {viewMode === 1 && (
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white">
            <AppEditor
              schema={schema}
              block={block}
              appId={appId}
              key={appId}
            />
          </div>
        )}
      </div>
    </>
  );
};

Apps.getLayout = getLayout;
export default Apps;
