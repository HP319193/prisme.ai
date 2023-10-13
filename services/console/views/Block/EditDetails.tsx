import {
  CloseCircleOutlined,
  CodepenOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  FieldProps,
  Popover,
  Schema,
  SchemaForm,
  Tabs,
} from '@prisme.ai/design-system';
import { PopoverProps } from '@prisme.ai/design-system/lib/Components/Popover';
import { Trans, useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTracking } from '../../components/Tracking';
import useLocalizedText from '../../utils/useLocalizedText';
import CSSEditor from '../Page/CSSEditor';
import ConfirmButton from '../../components/ConfirmButton';

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
          title: t('blocks.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('blocks.details.slug.label'),
        },
        description: {
          type: 'localized:string',
          title: t('blocks.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 10 } },
        },
      },
    }),
    [t]
  );
  const advancedSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          title: t('blocks.details.photo.label'),
          description: t('blocks.details.photo.description'),
          'ui:widget': 'upload',
          'ui:options': {
            upload: { accept: 'image/jpg,image/gif,image/png,image/svg' },
          },
        },
        url: {
          type: 'string',
          title: t('blocks.details.url.label'),
          description: (
            <Trans
              t={t}
              i18nKey="blocks.details.url.description"
              components={{
                a: <a target="_blank" />,
              }}
            />
          ),
          'ui:widget': 'upload',
          'ui:options': {
            upload: {
              accept: '.js',
              defaultPreview: (
                <CodepenOutlined className="text-4xl !text-gray-200 flex items-center" />
              ),
            },
          },
        },
      },
    }),
    [t]
  );
  const stylesSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        css: {
          type: 'string',
          'ui:widget': (props: FieldProps) => <CSSEditor {...props} opened />,
        },
      },
    }),
    []
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
          {t('details.save', { context: 'block' })}
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
              key: 'advanced',
              label: t('blocks.builder.advanced.label'),
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
              confirmLabel={t('blocks.builder.delete.confirm', {
                name: localize(value.name),
              })}
            >
              <DeleteOutlined />
              <span className="flex">{t('blocks.builder.delete.label')}</span>
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
