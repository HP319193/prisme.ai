import {
  CloseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Popover,
  Schema,
  SchemaForm,
  Tabs,
} from '@prisme.ai/design-system';
import { PopoverProps } from '@prisme.ai/design-system/lib/Components/Popover';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTracking } from '../../components/Tracking';
import useLocalizedText from '../../utils/useLocalizedText';
import ConfirmButton from '../../components/ConfirmButton';
import ArgumentsEditor from '../../components/SchemaFormBuilder/ArgumentsEditor';
import { SLUG_VALIDATION_REGEXP } from '../../utils/regex';

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
  const [values, setValues] = useState(value);

  const configSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'localized:string',
          title: t('automations.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('automations.details.slug.label'),
          pattern: SLUG_VALIDATION_REGEXP.source,
          errors: {
            pattern: t('automations.save.error_InvalidSlugError'),
          },
        },
        description: {
          type: 'localized:string',
          title: t('automations.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 6 } },
        },
      },
      'ui:options': {
        grid: [
          [['name', 'slug'], ['description']],
          [['arguments']],
          [['private']],
          [['disabled']],
        ],
      },
    }),
    [t]
  );

  const schemaSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        arguments: {
          'ui:widget': ArgumentsEditor,
        },
      },
    }),
    []
  );
  const advancedSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        private: {
          type: 'boolean',
          title: t('automations.details.private.label'),
          description: t('automations.details.private.description'),
        },
        disabled: {
          type: 'boolean',
          title: t('automations.details.disabled.label'),
          description: t('automations.details.disabled.description'),
        },
      },
      'ui:options': {
        grid: [
          [['name', 'slug'], ['description']],
          [['arguments']],
          [['private']],
          [['disabled']],
        ],
      },
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
          {t('automations.details.title')}
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
              label: t('automations.details.setup'),
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
              key: 'schema',
              label: t('automations.arguments.title'),
              children: (
                <SchemaForm
                  schema={schemaSchema}
                  initialValues={values}
                  onChange={onChange(schemaSchema)}
                  onSubmit={submit}
                  buttons={buttons}
                />
              ),
            },
            {
              key: 'advanced',
              label: t('automations.details.advanced'),
              children: (
                <SchemaForm
                  schema={advancedSchema}
                  initialValues={values}
                  onChange={onChange(advancedSchema)}
                  onSubmit={submit}
                  buttons={buttons}
                />
              ),
            },
          ]}
          tabBarExtraContent={
            <ConfirmButton
              onConfirm={onDelete}
              confirmLabel={t('automations.delete.confirm', {
                name: localize(value.name),
              })}
            >
              <DeleteOutlined />
              <span className="flex">{t('automations.delete.label')}</span>
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
