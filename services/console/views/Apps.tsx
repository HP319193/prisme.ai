import {
  Modal,
  notification,
  PageHeader,
  Schema,
} from '@prisme.ai/design-system';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import getLayout from '../layouts/WorkspaceLayout';
import { useWorkspace } from '../components/WorkspaceProvider';
import { useApps } from '../components/AppsProvider';
import useLocalizedText from '../utils/useLocalizedText';
import EditDetails from '../layouts/EditDetails';
import AppEditor from '../components/AppEditor';
import EditableTitle from '../components/AutomationBuilder/EditableTitle';

interface AppsProps extends Prismeai.DetailedAppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const Apps = ({}: AppsProps) => {
  const { workspace } = useWorkspace();
  const { appInstances, saveAppInstance } = useApps();
  const { localize } = useLocalizedText();

  const [currentApp, setCurrentApp] = useState<Prismeai.DetailedAppInstance>();

  const {
    push,
    query: { appId },
  } = useRouter();

  useEffect(() => {
    if (!appInstances) return;
    const workspaceApps = appInstances.get(workspace.id);
    if (!workspaceApps) return;

    setCurrentApp(
      workspaceApps.find((appInstance) => appInstance.slug === appId)
    );
  }, [appId, appInstances, workspace.id]);

  const { photo, config: { schema, block } = {} } = (currentApp || {
    config: {},
  }) as Prismeai.DetailedAppInstance;

  const { uninstallApp } = useWorkspaces();
  const { t } = useTranslation('workspaces');

  const onDelete = useCallback(() => {
    if (typeof appId !== 'string') return;

    Modal.confirm({
      icon: <DeleteOutlined />,
      content: t('apps.uninstall', { appName: appId }),
      onOk: () => {
        push(`/workspaces/${workspace.id}`);
        uninstallApp(workspace.id, appId);
      },
      okText: t('apps.uninstallConfirm', { appName: appId }),
    });
  }, [appId, push, t, uninstallApp, workspace.id]);

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

  if (typeof appId !== 'string' || !currentApp) return null;

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-row items-center text-lg">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} className="w-10 h-10 mr-2" alt={appId} />
            )}

            <span className="font-medium -mt-[0.3rem]">
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
              />
            </span>
            <span className="text-gray flex border-r border-l border-solid border-pr-gray-200 h-[26px] items-center px-3">
              <EditDetails
                schema={detailsFormSchema}
                value={{ ...value }}
                onSave={updateDetails}
                onDelete={onDelete}
                context="apps"
                key={currentApp.slug}
              />
            </span>
          </div>
        }
      />
      <Head>
        <title>
          {t('page_title', {
            elementName: localize(currentApp.appName),
          })}
        </title>
      </Head>
      <AppEditor schema={schema} block={block} appId={appId} key={appId} />
    </>
  );
};

Apps.getLayout = getLayout;
export default Apps;
