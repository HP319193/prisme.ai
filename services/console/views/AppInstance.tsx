import { DeleteOutlined } from '@ant-design/icons';
import { Schema } from '@prisme.ai/design-system';
import { Modal, notification, PageHeader, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AppEditor from '../components/AppEditor';
import HorizontalSeparatedNav from '../components/HorizontalSeparatedNav';
import EditDetails from '../layouts/EditDetails';
import getLayout from '../layouts/WorkspaceLayout';
import AppInstanceProvider, {
  useAppInstance,
} from '../providers/AppInstanceProvider';
import { useWorkspace } from '../providers/Workspace';
import { SLUG_VALIDATION_REGEXP } from '../utils/regex';
import useLocalizedText from '../utils/useLocalizedText';

export const AppInstance = () => {
  const { appInstance, saveAppInstance, uninstallApp } = useAppInstance();
  const { workspace } = useWorkspace();
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();
  const [, { photo }] = Object.entries(workspace.imports || {}).find(
    ([slug]) => slug === appInstance.slug
  ) || [, {}];
  const [value, setValue] = useState(appInstance);
  const [viewMode, setViewMode] = useState(0);

  const save = useCallback(() => {
    saveAppInstance(value);
  }, [saveAppInstance, value]);
  // Need to get the latest version with the latest value associated
  const saveAfterChange = useRef(save);
  useEffect(() => {
    saveAfterChange.current = save;
  }, [save]);

  const saveDetails = useCallback(
    async ({ slug = '', disabled }: Prismeai.AppInstance) => {
      const newValue = {
        ...value,
        slug,
        disabled,
      };
      setValue(newValue);
      try {
        await saveAppInstance(newValue);
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
    [push, saveAppInstance, t, value, workspace.id]
  );

  const onDelete = useCallback(() => {
    Modal.confirm({
      icon: <DeleteOutlined />,
      content: t('apps.uninstall', appInstance),
      onOk: () => {
        push(`/workspaces/${workspace.id}`);
        uninstallApp();
      },
      okText: t('apps.uninstallConfirm', appInstance),
    });
  }, [appInstance, push, t, uninstallApp, workspace.id]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          title: t('apps.details.slug.label'),
          pattern: SLUG_VALIDATION_REGEXP.source,
          errors: {
            pattern: t('automations.save.error_InvalidSlugError'),
          },
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
              <Tooltip
                title={t('details.title', { context: 'apps' })}
                placement="bottom"
              >
                <EditDetails
                  schema={detailsFormSchema}
                  value={value}
                  onSave={saveDetails}
                  onDelete={onDelete}
                  context="apps"
                  key={appInstance.slug}
                />
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
          </HorizontalSeparatedNav>
        }
        // extra={[
        //   appInstance.documentation && (
        //     <div>
        //       <div className="ml-3">
        //         <Segmented
        //           key="nav"
        //           options={[
        //             {
        //               label: t('apps.doc'),
        //               value: 0,
        //               icon: <EyeOutlined />,
        //             },
        //             {
        //               label: t('apps.config'),
        //               value: 1,
        //               icon: <EditOutlined />,
        //             },
        //           ]}
        //           onChange={(v) => setViewMode(+v)}
        //           className="pr-segmented-accent"
        //         />
        //       </div>
        //     </div>
        //   ),
        // ]}
      />
      <Head>
        <title>
          {t('page_title', {
            elementName: localize(appInstance.slug),
          })}
        </title>
      </Head>
      <div className="relative flex flex-1 bg-blue-200 h-full overflow-y-auto">
        {/*docPage && <IFrameLoader src={docPage} className="flex flex-1" />*/}
        {(true || viewMode === 1) && (
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white">
            <AppEditor
              schema={appInstance.config.schema}
              block={appInstance.config.block}
              appId={appInstance.slug!}
              key={appInstance.slug}
            />
          </div>
        )}
      </div>
    </>
  );
};

const AppInstanceWithProvider = () => {
  const {
    query: { appId },
    push,
  } = useRouter();
  const { workspace } = useWorkspace();

  return (
    <AppInstanceProvider id={`${appId}`} workspaceId={workspace.id}>
      <AppInstance />
    </AppInstanceProvider>
  );
};
AppInstanceWithProvider.getLayout = getLayout;
export default AppInstanceWithProvider;
