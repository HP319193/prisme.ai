import {
  CloseCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Menu,
  Modal,
  Popover,
  Schema,
  SchemaForm,
} from '@prisme.ai/design-system';
import { Dropdown, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import useLocalizedText from '../utils/useLocalizedText';

interface EditDetailsprops {
  schema: Schema;
  value: any;
  onSave: (values: any) => Promise<void | Record<string, string>>;
  onDelete: () => void;
  context?: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export const EditDetails = ({
  schema,
  value,
  onSave,
  onDelete,
  context,
  ...props
}: EditDetailsprops) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();

  const confirmDelete = useCallback(() => {
    Modal.confirm({
      icon: <DeleteOutlined />,
      title: t('details.delete.confirm.title', {
        name: localize(value.name),
        context,
      }),
      content: t('details.delete.confirm.content', { context }),
      cancelText: t('details.delete.confirm.cancel', { context }),
      okText: t('details.delete.confirm.ok', { context }),
      onOk: () => {
        onDelete();
      },
      zIndex: 1031,
    });
  }, [context, localize, onDelete, t, value.name]);

  const publishVersion = useCallback(async () => {
    const errors = await onSave(value);
    if (errors) return;
    await api
      .workspaces(value.id)
      .versions.create({ description: `${new Date()}` });
  }, [onSave, value]);

  // This force form to be rerender with fresh values
  const [mountedForm, setMountedForm] = useState(false);
  useEffect(() => {
    if (props.visible) {
      setMountedForm(true);
    } else {
      setTimeout(() => setMountedForm(false), 200);
    }
  }, [props.visible]);

  return (
    <Popover
      title={({ setVisible }) => (
        <div className="flex flex-1 justify-between">
          {t('details.title', { context })}
          <button onClick={() => setVisible(false)}>
            <CloseCircleOutlined />
          </button>
        </div>
      )}
      content={({ setVisible }) => (
        <>
          {mountedForm && (
            <SchemaForm
              schema={schema}
              onSubmit={async (values) => {
                const errors = await onSave(values);
                if (!errors || Object.keys(errors).length === 0) {
                  setVisible(false);
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
                  <Dropdown.Button
                    type="primary"
                    htmlType="submit"
                    icon={<DownOutlined />}
                    overlay={
                      <Menu
                        onClick={(item) => {
                          const key =
                            typeof item === 'string' ? item : item.key;
                          switch (key) {
                            case 'newVersion':
                              return publishVersion();
                          }
                        }}
                        items={[
                          {
                            key: 'newVersion',
                            label: (
                              <Tooltip
                                title={t(
                                  'workspace.versions.create.description'
                                )}
                              >
                                {t('workspace.versions.create.label')}
                              </Tooltip>
                            ),
                          },
                        ]}
                      />
                    }
                  >
                    {t('details.save', { context })}
                  </Dropdown.Button>
                </div>,
              ]}
            />
          )}
        </>
      )}
      overlayClassName="min-w-[50%]"
      {...props}
    >
      <SettingOutlined className="text-lg" />
    </Popover>
  );
};

export default EditDetails;
