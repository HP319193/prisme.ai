import {
  CloseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  FieldProps,
  Popover,
  Schema,
  Tabs,
} from '@prisme.ai/design-system';
import { PopoverProps } from '@prisme.ai/design-system/lib/Components/Popover';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSectionsIds from '../../providers/Page/useSectionsIds';
import { useTracking } from '../../components/Tracking';
import useLocalizedText from '../../utils/useLocalizedText';
import CSSEditor from './CSSEditor';
import ConfirmButton from '../../components/ConfirmButton';
import SchemaForm from '../../components/SchemaForm/SchemaForm';

interface EditDetailsprops extends Omit<PopoverProps, 'content'> {
  value: any;
  onSave: (values: any) => Promise<void | Record<string, string>>;
  onDelete: () => void;
  context?: string;
  disabled?: boolean;
}

export const EditDetails = ({
  value,
  onSave,
  onDelete,
  context,
  disabled,
  onOpenChange,
  ...props
}: EditDetailsprops) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { trackEvent } = useTracking();
  const [open, setOpen] = useState(false);
  const sectionsIds = useSectionsIds();
  const [values, setValues] = useState(value);

  const configSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'localized:string',
          title: t('pages.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('pages.details.slug.label'),
        },
        description: {
          type: 'localized:string',
          title: t('pages.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 10 } },
        },
      },
    }),
    [t]
  );
  const lifecycleSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        onInit: {
          type: 'string',
          title: t('pages.blocks.settings.onInit.label'),
          description: t('pages.blocks.settings.onInit.description'),
        },
        automation: {
          type: 'string',
          title: t('pages.blocks.settings.automation.label'),
          description: t('pages.blocks.settings.automation.description'),
          'ui:widget': 'select',
          'ui:options': {
            from: 'automations',
            filter: 'endpoint',
          },
        },
        updateOn: {
          type: 'string',
          title: t('pages.blocks.settings.updateOn.label'),
          description: t('pages.blocks.settings.updateOn.description'),
        },
      },
    }),
    [t]
  );
  const stylesSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        styles: {
          type: 'string',
          'ui:widget': (props: FieldProps) => (
            <CSSEditor {...props} sectionIds={sectionsIds} opened />
          ),
        },
      },
    }),
    [sectionsIds]
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
      const newValues = { ...values };
      Object.keys(schema?.properties || {}).forEach((k) => {
        newValues[k] = changedValues[k];
      });
      setValues(newValues);
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
          {t('details.save', { context: 'page' })}
        </Button>
      </div>,
    ],
    [disabled, t]
  );

  return (
    <Popover
      title={({ setOpen }) => (
        <div className="flex flex-1 justify-between">
          {t('details.title', { context })}
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
              key: 'config',
              label: t('blocks.builder.setup.label'),
              children: (
                <SchemaForm
                  schema={configSchema}
                  initialValues={values}
                  onChange={onChange(configSchema)}
                  onSubmit={submit}
                  buttons={buttons}
                />
              ),
              active: true,
            },
            {
              key: 'lifecycle',
              label: t('blocks.builder.lifecycle.label'),
              children: (
                <SchemaForm
                  schema={lifecycleSchema}
                  initialValues={values}
                  onChange={onChange(lifecycleSchema)}
                  onSubmit={submit}
                  buttons={buttons}
                />
              ),
            },
            {
              key: 'styles',
              label: t('blocks.builder.style.label'),
              children: (
                <SchemaForm
                  schema={stylesSchema}
                  initialValues={values}
                  onChange={onChange(stylesSchema)}
                  onSubmit={submit}
                  buttons={buttons}
                />
              ),
            },
          ]}
          tabBarExtraContent={
            <ConfirmButton
              onConfirm={onDelete}
              confirmLabel={t('pages.delete.confirm.title', {
                name: localize(value.name),
              })}
            >
              <DeleteOutlined />
              <span className="flex">
                {t('details.delete.label', { context })}
              </span>
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
