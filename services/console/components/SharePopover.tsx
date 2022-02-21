import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { Button, Input, Select, Space, Table } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { Form, useField } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import FieldContainer from '../layouts/Field';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { usePermissions } from './PermissionsProvider';
import { DeleteOutlined } from '@ant-design/icons';

interface SharePopoverProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface userPermissionForm {
  email: string;
  role: Prismeai.Role;
}

type SelectOption = {
  value: string;
  label: string;
};

const RoleSelect = ({
  rolesOptions,
  t,
}: {
  rolesOptions: SelectOption[];
  t: Function;
}) => {
  const { input: roleInput } = useField('role', {
    initialValue: rolesOptions[0].value,
  });

  return (
    <Select
      {...roleInput}
      selectOptions={rolesOptions}
      label={t('share.role')}
      className="w-40"
    />
  );
};

const SharePopover = ({ setVisible }: SharePopoverProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const {
    usersPermissions,
    getUsersPermissions,
    addUserPermissions,
    removeUserPermissions,
  } = usePermissions();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();

  const generateRowButtons = useCallback(
    (onDelete: Function) => (
      <div className="flex flex-row justify-center">
        <Tooltip title={t('share.delete')}>
          <Button onClick={() => onDelete()}>
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </div>
    ),
    [t]
  );

  const rolesOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'owner', label: t('share.roles.owner') },
      { value: 'editor', label: t('share.roles.editor') },
    ],
    [t]
  );

  const initialFetch = useCallback(async () => {
    getUsersPermissions('workspaces', workspaceId);
  }, [getUsersPermissions, workspaceId]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  const dataSource = useMemo(() => {
    const data = usersPermissions.get(workspaceId);
    if (!data) {
      return [];
    }
    const rows = data
      .filter(({ id }) => !!id)
      .map(({ email, role, id }) => ({
        key: id,
        email,
        role,
        actions: generateRowButtons(() =>
          // @ts-ignore
          // Previous filter ensure we have an id defined
          removeUserPermissions('workspaces', workspaceId, id)
        ),
      }));
    return rows;
  }, [
    generateRowButtons,
    removeUserPermissions,
    usersPermissions,
    workspaceId,
  ]);

  const onSubmit = ({ email, role }: userPermissionForm) => {
    addUserPermissions('workspaces', workspaceId, { email, role });
  };

  return (
    <Space direction="vertical" className="w-[60vw]">
      <Form onSubmit={onSubmit} initialValues={{ email: '', role: '' }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Space className="flex flex-row">
              <FieldContainer name="email">
                {({ input }) => <Input label={t('share.email')} {...input} />}
              </FieldContainer>
              <div className="mb-5">
                <span className={`flex flex-col`}>
                  <RoleSelect rolesOptions={rolesOptions} t={t} />
                </span>
              </div>
              <Button type="submit">{commonT('add')}</Button>
            </Space>
          </form>
        )}
      </Form>
      <Table
        dataSource={dataSource}
        columns={[
          { title: t('share.email'), dataIndex: 'email', key: 'email' },
          {
            title: t('share.role'),
            dataIndex: 'role',
            key: 'role',
          },
          {
            title: t('share.actions'),
            dataIndex: 'actions',
            key: 'actions',
            width: '15%',
          },
        ]}
        bordered
        pagination={{ pageSize: 10, position: [] }}
        scroll={{ y: 500 }}
      />
    </Space>
  );
};

export default SharePopover;
