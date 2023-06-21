import {
  CloseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Modal,
  Popover,
  Schema,
  SchemaForm,
} from '@prisme.ai/design-system';
import { PopoverProps } from '@prisme.ai/design-system/lib/Components/Popover';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTracking } from '../components/Tracking';
import useLocalizedText from '../utils/useLocalizedText';

interface EditDetailsprops extends Omit<PopoverProps, 'content'> {
  schema: Schema;
  value: any;
  onSave: (values: any) => Promise<void | Record<string, string>>;
  onDelete: () => void;
  context?: string;
  disabled?: boolean;
}

export const EditDetails = ({
  schema,
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

  const confirmDelete = useCallback(() => {
    const tOptions = {
      name: localize(value.name) || value.slug,
      context,
    };
    Modal.confirm({
      icon: <DeleteOutlined />,
      title: t('details.delete.confirm.title', tOptions),
      content: t('details.delete.confirm.content', tOptions),
      cancelText: t('details.delete.confirm.cancel', tOptions),
      okText: t('details.delete.confirm.ok', tOptions),
      onOk: () => {
        onDelete();
      },
      zIndex: 1031,
    });
  }, [context, localize, onDelete, t, value.name, value.slug]);

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
        <SchemaForm
          schema={schema}
          onSubmit={async (values) => {
            const errors = await onSave(values);
            if (!errors || Object.keys(errors).length === 0) {
              setOpen(false);
              return;
            }
            return errors;
          }}
          initialValues={value}
          buttons={[
            <div key="1" className="flex flex-1 justify-between !mt-2">
              <Button
                variant="grey"
                onClick={confirmDelete}
                className="!flex items-center"
              >
                <DeleteOutlined />
                {t('details.delete.label', { context })}
              </Button>
              <Button variant="primary" type="submit" disabled={disabled}>
                {t('details.save', { context })}
              </Button>
            </div>,
          ]}
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
