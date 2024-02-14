import {
  AppstoreAddOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  DeleteOutlined,
  ExportOutlined,
  LoadingOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Button,
  Collapse,
  notification,
  Popover,
  Schema,
  Tabs,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTracking } from '../../components/Tracking';
import useLocalizedText from '../../utils/useLocalizedText';
import ConfirmButton from '../../components/ConfirmButton';
import SchemaForm from '../../components/SchemaForm/SchemaForm';
import { WORKSPACE_SLUG_VALIDATION_REGEXP } from '../../utils/regex';
import ArgumentsEditor from '../../components/SchemaFormBuilder/ArgumentsEditor';
import { useWorkspace, Workspace } from '../../providers/Workspace';
import { useRouter } from 'next/router';
import { DisplayedSourceType, useWorkspaceLayout } from './context';
import PublishModal from '../../components/PublishModal';
import VersionModal from '../../components/VersionModal';
import api from '../../utils/api';

interface EditDetailsprops {
  children: ReactNode;
  className?: string;
}

export const EditDetails = ({ children, className }: EditDetailsprops) => {
  const { t } = useTranslation('workspaces');
  const { localize, localizeSchemaForm } = useLocalizedText();
  const { trackEvent } = useTracking();
  const { workspace, saveWorkspace, deleteWorkspace, saving } = useWorkspace();
  const { push } = useRouter();
  const { displaySource, sourceDisplayed } = useWorkspaceLayout();
  const [values, setValues] = useState(workspace);
  const [publishVisible, setPublishVisible] = useState(false);
  const [versionVisible, setVersionVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const displaySchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: t('workspace.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('workspace.details.slug.label'),
          pattern: WORKSPACE_SLUG_VALIDATION_REGEXP.source,
          errors: {
            pattern: t('workspace.details.slug.error'),
          },
        },
        description: {
          type: 'localized:string',
          title: t('workspace.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 6 } },
        },
        photo: {
          type: 'string',
          title: t('workspace.details.photo.label'),
          'ui:widget': 'upload',
        },
      },
    }),
    [t]
  );

  const configSchema: Schema = useMemo(
    () => ({
      type: 'object',
      title: t('workspace.details.config.value.label'),
      properties:
        values.config?.schema && localizeSchemaForm(values.config.schema),
      additionalProperties: !values.config?.schema,
    }),
    [localizeSchemaForm, t, values.config?.schema]
  );
  const schemaSchema: Schema = useMemo(
    () => ({
      title: t('workspace.details.config.schema.label'),
      description: t('workspace.details.config.schema.description'),
      'ui:widget': ArgumentsEditor,
    }),
    [t]
  );

  const initialOpenState = useRef(false);
  useEffect(() => {
    if (!initialOpenState.current) {
      initialOpenState.current = true;
      return;
    }
  }, [trackEvent]);

  const onChange = useCallback(
    (schema: Schema) => (changedValues: any) => {
      const {
        automations,
        pages,
        blocks,
        imports,
        id,
        createdAt,
        updatedAt,
        registerWorkspace,
        ...newValues
      } = { ...values } as Workspace;
      Object.keys(schema?.properties || {}).forEach((k) => {
        newValues[k as keyof typeof newValues] = changedValues[k];
      });
      setValues(newValues as Workspace);
    },
    [values]
  );

  const onConfigChanged = useCallback(
    (changed) => {
      const {
        automations,
        pages,
        blocks,
        imports,
        id,
        createdAt,
        updatedAt,
        registerWorkspace,
        ...newValues
      } = { ...values } as Workspace;
      if (
        !newValues.config?.schema ||
        newValues.config?.schema.additionalProperties
      ) {
        setValues({
          ...newValues,
          config: {
            ...newValues.config,
            value: changed,
          },
        } as Workspace);
        return;
      }
      Object.keys(newValues.config.schema || {}).forEach((k) => {
        newValues.config = newValues.config || {};
        newValues.config.value = newValues.config.value || {};
        newValues.config.value[k as keyof typeof newValues] = changed[k];
      });
      setValues(newValues as Workspace);
    },
    [values]
  );

  const onSchemaChanged = useCallback(
    (changed) => {
      const {
        automations,
        pages,
        blocks,
        imports,
        id,
        createdAt,
        updatedAt,
        registerWorkspace,
        ...newValues
      } = { ...values } as Workspace;

      setValues({
        ...newValues,
        config: {
          ...newValues.config,
          schema: changed,
        },
      } as Workspace);
    },
    [values]
  );

  const submit = useCallback(async () => {
    saveWorkspace(values);
    if (values.slug !== workspace.slug) {
      try {
        await saveWorkspace({ ...values, slug: values.slug });
      } catch {
        return {
          slug: t('workspace.details.slug.unique'),
        };
      }
    }
  }, [saveWorkspace, t, values, workspace.slug]);

  const confirmDelete = useCallback(() => {
    push('/workspaces');
    deleteWorkspace();
    notification.success({
      message: t('workspace.delete.toast'),
      placement: 'bottomRight',
    });
  }, [deleteWorkspace, push, t]);

  const onDisplaySource = useCallback(() => {
    trackEvent({
      name: 'Display Source from Details',
      action: 'click',
    });
    displaySource(
      sourceDisplayed === DisplayedSourceType.Config
        ? DisplayedSourceType.None
        : DisplayedSourceType.Config
    );
  }, [displaySource, sourceDisplayed, trackEvent]);

  const onDisplayRoles = useCallback(() => {
    trackEvent({
      name: 'Display Roles Edition',
      action: 'click',
    });
    displaySource(
      sourceDisplayed === DisplayedSourceType.Roles
        ? DisplayedSourceType.None
        : DisplayedSourceType.Roles
    );
  }, [displaySource, sourceDisplayed, trackEvent]);

  const onPublishAsApp = useCallback(() => {
    trackEvent({
      name: 'Display Publish as App Modal',
      action: 'click',
    });
    setPublishVisible(true);
    setOpen(false);
  }, [trackEvent]);

  const onVersion = useCallback(() => {
    trackEvent({
      name: 'Display Versionning Modal',
      action: 'click',
    });
    setVersionVisible(true);
    setOpen(false);
  }, [trackEvent]);

  const onExport = useCallback(async () => {
    trackEvent({
      name: 'Export',
      action: 'click',
    });
    if (exporting) return;
    setExporting(true);
    const zip = await api.workspaces(workspace.id).versions.export();
    const a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('download', `workspace-${workspace.id}.zip`);
    a.setAttribute('href', URL.createObjectURL(zip));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExporting(false);
  }, [exporting, trackEvent, workspace.id]);

  const buttons = useMemo(
    () => [
      <div key="1" className="flex flex-1 justify-end !mt-2 mx-4">
        <Button variant="primary" type="submit" disabled={saving}>
          {t('save', { ns: 'common' })}
        </Button>
      </div>,
    ],
    [saving, t]
  );

  return (
    <>
      <PublishModal
        visible={publishVisible}
        close={() => setPublishVisible(false)}
      />
      <VersionModal
        visible={versionVisible}
        close={() => setVersionVisible(false)}
      />

      <Popover
        titleClassName="flex m-0 pb-0 pt-4 pl-4 pr-4"
        title={({ setOpen }) => (
          <div className="flex flex-1 justify-between">
            {t('workspace.details.title')}
            <button
              onClick={() => {
                trackEvent({
                  name: 'Close Details Panel by clicking button',
                  action: 'click',
                });
                setOpen(false);
              }}
            >
              <CloseCircleOutlined />
            </button>
          </div>
        )}
        destroyTooltipOnHide
        content={({ setOpen }) => (
          <Tabs
            className="flex flex-1"
            items={[
              {
                key: 'display',
                label: t('workspace.details.setup.label'),
                children: (
                  <SchemaForm
                    schema={displaySchema}
                    initialValues={values}
                    onChange={onChange(displaySchema)}
                    onSubmit={submit}
                    buttons={buttons}
                  />
                ),
                active: true,
              },
              {
                key: 'actions',
                label: t('workspace.details.actions.label'),
                children: (
                  <div className="!flex flex-1 justify-between !mt-4 !mb-6">
                    <div className="flex flex-col items-start">
                      <Button
                        className="flex items-center"
                        onClick={onDisplaySource}
                      >
                        <CodeOutlined className="mr-2" />
                        {t(
                          `expert.${
                            sourceDisplayed === DisplayedSourceType.Config
                              ? 'hide'
                              : 'show'
                          }`
                        )}
                      </Button>
                      <Button
                        className="flex items-center"
                        onClick={onDisplayRoles}
                      >
                        <CodeOutlined className="mr-2" />
                        {t(
                          `expert.${
                            sourceDisplayed === DisplayedSourceType.Roles
                              ? 'hide'
                              : 'security'
                          }`
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-col items-start">
                      <Button
                        className="flex items-center"
                        onClick={onPublishAsApp}
                      >
                        <AppstoreAddOutlined className="mr-2" />
                        {t(`apps.publish.menuLabel`)}
                      </Button>
                      <Button onClick={onVersion}>
                        <TagOutlined className="mr-2" />
                        {t('workspace.versions.create.label')}
                      </Button>
                      <Button onClick={onExport}>
                        {exporting ? (
                          <LoadingOutlined className="mr-2" />
                        ) : (
                          <ExportOutlined className="mr-2" />
                        )}
                        {t('workspace.versions.export.label')}
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                key: 'config',
                label: t('workspace.details.config.label'),
                children: (
                  <>
                    <SchemaForm
                      schema={configSchema}
                      initialValues={values.config?.value}
                      onChange={onConfigChanged}
                      onSubmit={submit}
                      buttons={buttons}
                    />
                    <Collapse
                      items={[
                        {
                          label: t('workspace.details.config.schema.label'),
                          content: (
                            <SchemaForm
                              schema={schemaSchema}
                              initialValues={values.config?.schema}
                              onChange={onSchemaChanged}
                              onSubmit={submit}
                              buttons={buttons}
                            />
                          ),
                        },
                      ]}
                    />
                  </>
                ),
              },
            ]}
            tabBarExtraContent={
              <ConfirmButton
                onConfirm={confirmDelete}
                confirmLabel={t('workspace.delete.confirm', {
                  name: localize(values.name),
                })}
              >
                <DeleteOutlined className="translate-y-[-2px]" />
                <span className="flex">{t('workspace.delete.label')}</span>
              </ConfirmButton>
            }
          />
        )}
        overlayClassName="min-w-[50%] [&>.ant-popover-content]:-ml-[16px]"
        placement="bottomRight"
        className={className}
        open={open}
        onOpenChange={() => setOpen(!open)}
      >
        <>{children}</>
      </Popover>
    </>
  );
};

export default EditDetails;
