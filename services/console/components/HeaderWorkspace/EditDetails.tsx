import {
  AppstoreAddOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  DeleteOutlined,
  ExportOutlined,
  LoadingOutlined,
  SettingOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Button,
  Collapse,
  Popover,
  Schema,
  Tabs,
} from '@prisme.ai/design-system';
import { PopoverProps } from '@prisme.ai/design-system/lib/Components/Popover';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTracking } from '../../components/Tracking';
import useLocalizedText from '../../utils/useLocalizedText';
import ConfirmButton from '../../components/ConfirmButton';
import SchemaForm from '../../components/SchemaForm/SchemaForm';
import { SLUG_VALIDATION_REGEXP } from '../../utils/regex';
import ArgumentsEditor from '../SchemaFormBuilder/ArgumentsEditor';
import { Workspace } from '../../providers/Workspace';

interface EditDetailsprops extends Omit<PopoverProps, 'content'> {
  value: any;
  onSave: (values: any) => Promise<void | Record<string, string>>;
  onDelete: () => void;
  context?: string;
  disabled?: boolean;
  onDisplaySource: () => void;
  sourceDisplayed: boolean;
  onDisplayRoles: () => void;
  rolesDisplayed: boolean;
  onPublishAsApp: () => void;
  onVersion: () => void;
  onExport: () => void;
  exporting: boolean;
}

export const EditDetails = ({
  value,
  onSave,
  onDelete,
  context,
  disabled,
  onOpenChange,
  onDisplaySource,
  sourceDisplayed,
  onDisplayRoles,
  rolesDisplayed,
  onPublishAsApp,
  onVersion,
  onExport,
  exporting,
  ...props
}: EditDetailsprops) => {
  const { t } = useTranslation('workspaces');
  const { localize, localizeSchemaForm } = useLocalizedText();
  const { trackEvent } = useTracking();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(value);

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
          pattern: SLUG_VALIDATION_REGEXP.source,
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
      properties: localizeSchemaForm(values.config?.schema),
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
    trackEvent({
      name: `${open ? 'Open' : 'Close'} Details Panel`,
      action: 'click',
    });
  }, [open, trackEvent]);

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
      setValues(newValues);
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
        });
        return;
      }
      Object.keys(newValues.config.schema || {}).forEach((k) => {
        newValues.config = newValues.config || {};
        newValues.config.value = newValues.config.value || {};
        newValues.config.value[k as keyof typeof newValues] = changed[k];
      });
      setValues(newValues);
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
      });
    },
    [values]
  );

  const submit = useCallback(() => {
    onSave(values);
  }, [onSave, values]);

  const buttons = useMemo(
    () => [
      <div key="1" className="flex flex-1 justify-end !mt-2 mx-4">
        <Button variant="primary" type="submit" disabled={disabled}>
          {t('save', { ns: 'common' })}
        </Button>
      </div>,
    ],
    [disabled, t]
  );

  return (
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
                      {t(`expert.${sourceDisplayed ? 'hide' : 'show'}`)}
                    </Button>
                    <Button
                      className="flex items-center"
                      onClick={onDisplayRoles}
                    >
                      <CodeOutlined className="mr-2" />
                      {t(`expert.${rolesDisplayed ? 'hide' : 'security'}`)}
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
              onConfirm={onDelete}
              confirmLabel={t('workspace.delete.confirm', {
                name: localize(value.name),
              })}
            >
              <DeleteOutlined className="translate-y-[-2px]" />
              <span className="flex">{t('workspace.delete.label')}</span>
            </ConfirmButton>
          }
        />
      )}
      overlayClassName="min-w-[50%]"
      onOpenChange={(v) => {
        setOpen(v);
        onOpenChange?.(v);
      }}
      {...props}
    >
      <button type="button" className="text-lg text-gray focus:outline-none">
        <SettingOutlined />
      </button>
    </Popover>
  );
};

export default EditDetails;
